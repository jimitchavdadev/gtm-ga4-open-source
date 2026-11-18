use analytics_engine::ga4::{
    AudienceDefinition, AudienceEngine, CustomDefinitionsManager, CustomDimension,
    DefinitionScope, EcommerceEngine, EcommerceItem, EnterprisePropertyRouter,
    PropertyTier, RollupProperty, SubpropertyRule,
};
use analytics_engine::gtm_enterprise::{
    ApprovalStatus, ApprovalWorkflow, ContainerZone, EnterpriseRole,
};
use serde_json::json;

#[test]
fn test_gtm_enterprise_zones_and_approvals() {
    let zone = ContainerZone {
        id: "z1".into(),
        name: "EU Zone".into(),
        parent_container_id: "GTM-PARENT".into(),
        child_container_ids: vec!["GTM-CHILD".into()],
        url_boundaries: vec!["/eu/".into()],
        allowed_tag_types: Some(vec!["ga4_event".into()]),
        blocked_tag_types: Some(vec!["custom_html".into()]),
    };

    assert!(zone.matches_boundary("https://example.com/eu/shop"));
    assert!(!zone.matches_boundary("https://example.com/us/shop"));
    assert!(zone.is_tag_type_allowed("ga4_event"));
    assert!(!zone.is_tag_type_allowed("custom_html"));

    let mut wf = ApprovalWorkflow::new("ws_prod");
    assert!(wf.request_approval("user_editor", EnterpriseRole::Editor).is_ok());
    assert_eq!(wf.status, ApprovalStatus::PendingReview);
    assert!(wf.approve("user_approver", EnterpriseRole::Approver).is_ok());
    assert_eq!(wf.status, ApprovalStatus::Approved);
    assert!(wf.publish("user_pub", EnterpriseRole::Publisher).is_ok());
    assert_eq!(wf.status, ApprovalStatus::Published);
}

#[test]
fn test_ga4_advanced_ecommerce_and_audiences() {
    let mut custom_defs = CustomDefinitionsManager::new(PropertyTier::Standard);
    assert_eq!(custom_defs.max_event_dimensions(), 50);

    for i in 0..50 {
        custom_defs.add_dimension(CustomDimension {
            parameter_name: format!("dim_{}", i),
            display_name: format!("Dimension {}", i),
            description: "test".into(),
            scope: DefinitionScope::Event,
        }).unwrap();
    }
    assert!(custom_defs.add_dimension(CustomDimension {
        parameter_name: "dim_overflow".into(),
        display_name: "Overflow".into(),
        description: "overflow".into(),
        scope: DefinitionScope::Event,
    }).is_err());

    let items = vec![EcommerceItem {
        item_id: "SKU_1".into(),
        item_name: "T-Shirt".into(),
        price: 25.0,
        quantity: 2,
        item_category: Some("Apparel".into()),
        discount: Some(5.0),
    }];
    let rev = EcommerceEngine::calculate_item_revenue(&items);
    assert_eq!(rev, 40.0);

    let abandonment = EcommerceEngine::calculate_cart_abandonment_rate(100, 30);
    assert_eq!(abandonment, 70.0);

    let audience = AudienceDefinition {
        id: "aud_purchasers".into(),
        name: "Purchasers".into(),
        description: "Users with purchase".into(),
        membership_duration_days: 30,
        required_event: "purchase".into(),
        min_event_count: 1,
        audience_trigger_event: Some("audience_purchaser_joined".into()),
    };
    let eval = AudienceEngine::evaluate_user(&audience, &["page_view".into(), "purchase".into()]);
    assert!(eval.is_member);
    assert_eq!(eval.triggered_event, Some("audience_purchaser_joined".into()));

    let rule = SubpropertyRule {
        subproperty_id: "sub_us".into(),
        source_property_id: "prop_main".into(),
        filter_param: "country".into(),
        filter_value: "US".into(),
    };
    let mut p = serde_json::Map::new();
    p.insert("country".into(), json!("US"));
    let routed = EnterprisePropertyRouter::route_to_subproperties(&[rule], "prop_main", &p);
    assert_eq!(routed, vec!["sub_us"]);

    let rollup = RollupProperty {
        rollup_id: "prop_global".into(),
        source_property_ids: vec!["prop_us".into(), "prop_eu".into()],
    };
    assert!(EnterprisePropertyRouter::is_included_in_rollup(&rollup, "prop_us"));
}
