use analytics_engine::ga4::{
    BigQueryExporter, EnhancedMeasurementEvaluator, PredictiveEngine,
};
use analytics_engine::gtm::{
    BuiltInVariableRegistry, CustomTemplate, GtmFolder, TemplatePermission, TemplateType,
};
use analytics_engine::wire::model::CanonicalEvent;

#[test]
fn test_custom_templates_and_permissions() {
    let perm = TemplatePermission {
        permission_type: "read_cookies".into(),
        allowed_keys: vec!["_ga".into(), "_fpid".into()],
        allowed_urls: vec![],
    };

    let tmpl = CustomTemplate::new("t1", "Cookie Extractor", TemplateType::Variable, "return getCookieValues('_ga');")
        .with_permission(perm);

    assert!(tmpl.can_read_cookie("_ga"));
    assert!(tmpl.can_read_cookie("_fpid"));
    assert!(!tmpl.can_read_cookie("session_secret"));
    assert!(!tmpl.can_access_global("window"));
}

#[test]
fn test_builtin_variables_and_folders() {
    let catalog = BuiltInVariableRegistry::get_standard_catalog();
    assert_eq!(catalog.len(), 24);
    assert!(catalog.iter().any(|v| v.name == "Page URL" && v.is_enabled));
    assert!(catalog.iter().any(|v| v.name == "Event" && v.is_enabled));

    let mut folder = GtmFolder::new("f1", "ws1", "Analytics Tags");
    folder.add_entity("tag_ga4_config");
    folder.add_entity("tag_ga4_event");
    assert_eq!(folder.entity_ids.len(), 2);
    folder.remove_entity("tag_ga4_config");
    assert_eq!(folder.entity_ids.len(), 1);
}

#[test]
fn test_enhanced_measurement_evaluator() {
    // File download
    let dl = EnhancedMeasurementEvaluator::is_file_download("https://example.com/assets/annual-report.pdf");
    assert_eq!(dl, Some(("annual-report.pdf".into(), "pdf".into())));
    assert_eq!(EnhancedMeasurementEvaluator::is_file_download("https://example.com/page.html"), None);

    // Outbound click
    assert!(EnhancedMeasurementEvaluator::is_outbound_click("example.com", "https://partner.com/deal"));
    assert!(!EnhancedMeasurementEvaluator::is_outbound_click("example.com", "https://example.com/about"));

    // Search query
    let query_params = vec!["q".into(), "search".into()];
    let term = EnhancedMeasurementEvaluator::extract_search_term("https://example.com/search?q=running+shoes", &query_params);
    assert_eq!(term, Some("running shoes".into()));
}

#[test]
fn test_predictive_metrics_model() {
    // Highly active user
    let active = PredictiveEngine::calculate_metrics(1, 15, 3, 450.0);
    assert!(active.purchase_probability > 0.5);
    assert!(active.churn_probability < 0.4);
    assert!(active.predicted_revenue_28d > 50.0);

    // Dormant user
    let dormant = PredictiveEngine::calculate_metrics(35, 1, 0, 0.0);
    assert!(dormant.purchase_probability < 0.2);
    assert!(dormant.churn_probability > 0.7);
}

#[test]
fn test_bigquery_export_schema() {
    let mut params = std::collections::HashMap::new();
    params.insert("page_location".into(), serde_json::json!("https://example.com/shop"));
    params.insert("value".into(), serde_json::json!(99.5));

    let ev = CanonicalEvent {
        client_id: "123.456".into(),
        user_id: Some("user_abc".into()),
        session_id: Some(1700000000),
        session_number: Some(1),
        event_name: "purchase".into(),
        timestamp_micros: 1700000000000000,
        event_params: params,
        user_properties: std::collections::HashMap::new(),
        consent_state: Some("analytics_storage=granted".into()),
        consent_detail: None,
        is_conversion: true,
        ..Default::default()
    };

    let bq = BigQueryExporter::format_event(&ev);
    assert_eq!(bq.event_name, "purchase");
    assert_eq!(bq.user_pseudo_id, "123.456");
    assert_eq!(bq.user_id, Some("user_abc".into()));
    assert_eq!(bq.event_params.len(), 2);
    assert!(bq.event_params.iter().any(|p| p.key == "page_location"));
}
