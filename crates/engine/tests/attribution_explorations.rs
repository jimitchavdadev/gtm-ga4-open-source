use analytics_engine::attribution::last_click::LastClickAttribution;
use analytics_engine::attribution::markov::MarkovAttribution;
use analytics_engine::attribution::shapley::ShapleyAttribution;
use analytics_engine::attribution::types::{Journey, Touchpoint};
use analytics_engine::explorations::cohort::CohortExplorationEngine;
use analytics_engine::explorations::freeform::FreeFormEngine;
use analytics_engine::explorations::funnel::{FunnelExplorationEngine, FunnelStepConfig};
use analytics_engine::explorations::path::PathExplorationEngine;
use analytics_engine::explorations::segment_overlap::SegmentOverlapEngine;
use analytics_engine::explorations::user_lifetime::UserLifetimeEngine;
use std::collections::{HashMap, HashSet};

#[test]
fn test_attribution_algorithms() {
    let journeys = vec![
        Journey {
            id: "j1".into(),
            touchpoints: vec![
                Touchpoint { channel: "Paid Search".into(), timestamp: 1 },
                Touchpoint { channel: "Organic Search".into(), timestamp: 2 },
            ],
            converted: true,
            revenue: 100.0,
        },
        Journey {
            id: "j2".into(),
            touchpoints: vec![
                Touchpoint { channel: "Paid Search".into(), timestamp: 1 },
            ],
            converted: true,
            revenue: 50.0,
        },
    ];

    let last_click = LastClickAttribution::calculate(&journeys);
    assert!(last_click.weights.contains_key("Organic Search"));
    assert!(last_click.weights.contains_key("Paid Search"));

    let markov = MarkovAttribution::calculate(&journeys);
    assert!(!markov.weights.is_empty());

    let shapley = ShapleyAttribution::calculate(&journeys);
    assert!(!shapley.weights.is_empty());
}

#[test]
fn test_freeform_and_funnel_explorations() {
    let entries = vec![
        HashMap::from([
            ("device".into(), serde_json::json!("Mobile")),
            ("users".into(), serde_json::json!(200)),
            ("sessions".into(), serde_json::json!(250)),
            ("engaged".into(), serde_json::json!(180)),
            ("conversions".into(), serde_json::json!(15)),
            ("revenue".into(), serde_json::json!(1200.0)),
        ]),
        HashMap::from([
            ("device".into(), serde_json::json!("Desktop")),
            ("users".into(), serde_json::json!(400)),
            ("sessions".into(), serde_json::json!(500)),
            ("engaged".into(), serde_json::json!(410)),
            ("conversions".into(), serde_json::json!(35)),
            ("revenue".into(), serde_json::json!(3500.0)),
        ]),
    ];

    let freeform = FreeFormEngine::build_report("device", &entries);
    assert_eq!(freeform.rows.len(), 2);
    assert_eq!(freeform.total_users, 600);

    let funnel_cfg = vec![
        FunnelStepConfig { step_name: "Visit".into(), event_name: "page_view".into() },
        FunnelStepConfig { step_name: "Cart".into(), event_name: "add_to_cart".into() },
        FunnelStepConfig { step_name: "Purchase".into(), event_name: "purchase".into() },
    ];
    let user_flows = vec![
        vec!["page_view".into(), "add_to_cart".into(), "purchase".into()],
        vec!["page_view".into(), "add_to_cart".into()],
        vec!["page_view".into()],
    ];

    let funnel = FunnelExplorationEngine::evaluate(&funnel_cfg, &user_flows, false);
    assert_eq!(funnel.steps.len(), 3);
    assert_eq!(funnel.steps[0].users, 3);
    assert_eq!(funnel.steps[1].users, 2);
    assert_eq!(funnel.steps[2].users, 1);
}

#[test]
fn test_path_and_segment_overlap() {
    let flows = vec![
        vec!["session_start".into(), "view_item".into(), "purchase".into()],
        vec!["session_start".into(), "scroll".into()],
    ];
    let path_report = PathExplorationEngine::build_forward_path("session_start", &flows, 3);
    assert_eq!(path_report.tree.count, 2);
    assert_eq!(path_report.tree.children.len(), 2);

    let seg_a: HashSet<String> = ["u1", "u2", "u3"].iter().map(|s| s.to_string()).collect();
    let seg_b: HashSet<String> = ["u2", "u3", "u4"].iter().map(|s| s.to_string()).collect();

    let overlap = SegmentOverlapEngine::compute_overlap(("Mobile", &seg_a), ("Purchasers", &seg_b), None);
    assert_eq!(overlap.total_unique_users, 4);
    assert_eq!(overlap.intersections.len(), 3);
}

#[test]
fn test_cohort_and_lifetime_explorations() {
    let cohorts = [
        ("Week 1", 1000, [100.0, 35.0, 22.0].as_slice()),
        ("Week 2", 1200, [100.0, 38.0].as_slice()),
    ];
    let cohort_report = CohortExplorationEngine::build_weekly_cohort_report(&cohorts);
    assert_eq!(cohort_report.cohorts.len(), 2);
    assert_eq!(cohort_report.average_retention.len(), 3);

    let ltv_data = [
        ("Organic Search", 500, 15000.0, 150, 45.0),
        ("Paid Search", 300, 12000.0, 110, 35.0),
    ];
    let ltv_report = UserLifetimeEngine::build_report(&ltv_data);
    assert_eq!(ltv_report.rows.len(), 2);
    assert_eq!(ltv_report.total_lifetime_revenue, 27000.0);
    assert!(ltv_report.overall_ltv > 0.0);
}
