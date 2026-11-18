use analytics_engine::consent::cookieless::CookielessManager;
use analytics_engine::consent::gcd::{GcdCodec, GcdSource};
use analytics_engine::consent::gcs::GcsCodec;
use analytics_engine::consent::types::{ConsentSettings, ConsentStatus};
use analytics_engine::identity::graph::IdentityGraph;
use analytics_engine::identity::reporting_identity::{
    IdentitySpace, ReportingIdentityMode, ReportingIdentityResolver,
};
use analytics_engine::modeling::behavioral::{BehavioralModelEngine, CohortMetrics};
use analytics_engine::modeling::conversion::{ConversionModelEngine, ConversionModelInput};
use analytics_engine::wire::model::CanonicalEvent;

#[test]
fn test_gcs_encoding_and_decoding() {
    let settings = ConsentSettings {
        ad_storage: ConsentStatus::Granted,
        analytics_storage: ConsentStatus::Denied,
        ad_user_data: ConsentStatus::Granted,
        ad_personalization: ConsentStatus::Denied,
    };
    let gcs = GcsCodec::encode(&settings);
    assert_eq!(gcs, "G110");

    let decoded = GcsCodec::decode(&gcs).expect("Decode should succeed");
    assert_eq!(decoded.ad_storage, ConsentStatus::Granted);
    assert_eq!(decoded.analytics_storage, ConsentStatus::Denied);
}

#[test]
fn test_gcd_granular_signals() {
    let sources = [
        GcdSource::DefaultDenied,
        GcdSource::UpdatedGranted,
        GcdSource::DefaultGranted,
        GcdSource::UpdatedDenied,
    ];
    let gcd = GcdCodec::encode(sources);
    assert_eq!(gcd, "1pvt r5".replace(' ', ""));

    let decoded = GcdCodec::decode(&gcd).expect("GCD decode should succeed");
    assert_eq!(decoded.ad_storage, ConsentStatus::Denied);
    assert_eq!(decoded.analytics_storage, ConsentStatus::Granted);
    assert_eq!(decoded.ad_user_data, ConsentStatus::Granted);
    assert_eq!(decoded.ad_personalization, ConsentStatus::Denied);
}

#[test]
fn test_cookieless_ping_handling() {
    let mut event = CanonicalEvent::default();
    event.client_id = "123.456".to_string();
    event.user_id = Some("user_99".to_string());
    event.consent_state = Some("G100".to_string());

    let settings = ConsentSettings::default(); // all denied
    assert!(CookielessManager::is_cookieless_ping(&event, &settings));

    let sanitized = CookielessManager::sanitize_cookieless_event(event);
    assert!(sanitized.user_id.is_none());
    assert!(sanitized.client_id.starts_with("ephemeral_"));
}

#[test]
fn test_reporting_identity_modes() {
    // 1. Device-based
    let res1 = ReportingIdentityResolver::resolve_identity(
        ReportingIdentityMode::DeviceBased,
        Some("user_abc"),
        "cid_xyz",
        false,
    );
    assert_eq!(res1.resolved_id, "cid_xyz");
    assert_eq!(res1.identity_space, IdentitySpace::DeviceId);
    assert!(!res1.is_modeled);

    // 2. Observed
    let res2 = ReportingIdentityResolver::resolve_identity(
        ReportingIdentityMode::Observed,
        Some("user_abc"),
        "cid_xyz",
        false,
    );
    assert_eq!(res2.resolved_id, "user_abc");
    assert_eq!(res2.identity_space, IdentitySpace::UserId);

    // 3. Blended with cookieless ping
    let res3 = ReportingIdentityResolver::resolve_identity(
        ReportingIdentityMode::Blended,
        None,
        "ephemeral_123",
        true,
    );
    assert_eq!(res3.identity_space, IdentitySpace::ModeledEphemeral);
    assert!(res3.is_modeled);
}

#[test]
fn test_behavioral_and_conversion_modeling() {
    let cohort = CohortMetrics {
        observed_users: 1000,
        observed_sessions: 1500,
        observed_engaged_sessions: 1200,
        cookieless_pings: 600,
    };
    let result = BehavioralModelEngine::compute_blended_metrics(&cohort);
    assert!(result.modeled_sessions > 0);
    assert!(result.blended_users > cohort.observed_users);
    assert!(result.blended_sessions > cohort.observed_sessions);
    assert!(result.model_confidence_score > 0.80);

    let conv_input = ConversionModelInput {
        observed_conversions: 50,
        observed_revenue: 5000.0,
        observed_conversion_rate: 0.0333,
        modeled_sessions: result.modeled_sessions,
    };
    let conv_output = ConversionModelEngine::model_conversions(&conv_input);
    assert!(conv_output.modeled_conversions > 0);
    assert!(conv_output.blended_conversions > 50);
    assert!(conv_output.modeled_lift_pct > 0.0);
}

#[test]
fn test_identity_graph_stitching() {
    let mut graph = IdentityGraph::new();
    graph.link("cid_1", "user_100");
    graph.link("cid_2", "user_100");

    assert_eq!(graph.get_user_id("cid_1"), Some("user_100"));
    assert_eq!(graph.get_canonical_id("cid_2", None), "user_100");
    assert_eq!(graph.get_canonical_id("cid_3", None), "cid_3");
}
