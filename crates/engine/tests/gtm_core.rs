use analytics_engine::consent::types::ConsentStatus;
use analytics_engine::gtm::{
    consent_manager::ConsentType, DataLayer, FiringRule, GtmConsentManager,
    MacroDagResolver, PredicateFilter, PredicateOperator, Tag, TagScheduler,
    Trigger, TriggerEngine, TriggerType,
};
use serde_json::json;
use std::collections::HashMap;

#[test]
fn test_datalayer_deep_merge_and_monotonic_ids() {
    let mut dl = DataLayer::new();
    let mut item1 = serde_json::Map::new();
    item1.insert("event".into(), json!("page_view"));
    item1.insert("page.title".into(), json!("Home"));
    let id1 = dl.push(item1).unwrap();
    assert_eq!(id1, 1);

    let mut item2 = serde_json::Map::new();
    item2.insert("event".into(), json!("purchase"));
    item2.insert("page.section".into(), json!("Checkout"));
    let id2 = dl.push(item2).unwrap();
    assert_eq!(id2, 2);

    assert_eq!(dl.query("page.title"), Some(json!("Home")));
    assert_eq!(dl.query("page.section"), Some(json!("Checkout")));
}

#[test]
fn test_macro_dag_resolution_and_cycles() {
    let mut dag = MacroDagResolver::new();
    dag.add_variable("BaseUrl", "https://example.com", vec![]);
    dag.add_variable("Endpoint", "{{BaseUrl}}/api/v1", vec!["BaseUrl".into()]);

    let ctx = HashMap::new();
    let resolved = dag.resolve_all(&ctx).unwrap();
    assert_eq!(resolved.get("Endpoint").unwrap(), "https://example.com/api/v1");

    let mut cyclic = MacroDagResolver::new();
    cyclic.add_variable("A", "{{B}}", vec!["B".into()]);
    cyclic.add_variable("B", "{{A}}", vec!["A".into()]);
    assert!(cyclic.has_circular_dependency());
}

#[test]
fn test_predicate_operators_and_consent() {
    let eq = PredicateFilter::new(PredicateOperator::Equals, "hello", "hello");
    assert!(eq.evaluate());

    let num_gt = PredicateFilter::new(PredicateOperator::GreaterThan, "25.5", "10.0");
    assert!(num_gt.evaluate());

    let reg = PredicateFilter::new(PredicateOperator::RegexMatch, "order_12345", r"^order_\d+$");
    assert!(reg.evaluate());

    let mut cm = GtmConsentManager::new();
    assert!(!cm.can_tag_fire(&["analytics_storage".into()]));
    cm.update_consent(ConsentType::AnalyticsStorage, ConsentStatus::Granted);
    assert!(cm.can_tag_fire(&["analytics_storage".into()]));
}

#[test]
fn test_trigger_and_tag_scheduling() {
    let mut trigger_engine = TriggerEngine::new();
    let trg = Trigger {
        id: "trg_1".into(),
        name: "Page View Trigger".into(),
        trigger_type: TriggerType::PageView,
        custom_event_name: None,
        filters: vec![],
        member_trigger_ids: vec![],
    };
    assert!(trigger_engine.evaluate(&trg, "page_view", &HashMap::new()));

    let mut scheduler = TagScheduler::new();
    let tags = vec![
        Tag {
            id: "t_low".into(),
            name: "Low Priority".into(),
            tag_type: "html".into(),
            priority: 10,
            firing_rule: FiringRule::Unlimited,
            setup_tag_ids: vec![],
            cleanup_tag_ids: vec![],
            required_consent: vec![],
        },
        Tag {
            id: "t_high".into(),
            name: "High Priority".into(),
            tag_type: "ga4_event".into(),
            priority: 100,
            firing_rule: FiringRule::OncePerPage,
            setup_tag_ids: vec!["t_setup".into()],
            cleanup_tag_ids: vec![],
            required_consent: vec![],
        },
    ];

    let order = scheduler.schedule_tags(&tags);
    assert_eq!(order, vec!["t_setup", "t_high", "t_low"]);

    let order2 = scheduler.schedule_tags(&tags);
    assert_eq!(order2, vec!["t_low"]);
}
