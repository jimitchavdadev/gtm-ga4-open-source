use analytics_engine::ga4::{
    AnnotationsManager, CountingMethod, KeyEventConfig, KeyEventType, KeyEventsManager,
    UserProvidedDataNormalizer,
};
use analytics_engine::gtm::{TagDiagnosticsEngine, TagQualityStatus};

#[test]
fn test_annotations_validation() {
    assert!(AnnotationsManager::validate_annotation("Spring Campaign 2026", "Launch promo", 0).is_ok());
    assert!(AnnotationsManager::validate_annotation("", "empty title", 0).is_err());

    let long_title = "A".repeat(61);
    assert!(AnnotationsManager::validate_annotation(&long_title, "desc", 0).is_err());

    let long_desc = "B".repeat(151);
    assert!(AnnotationsManager::validate_annotation("title", &long_desc, 0).is_err());

    assert!(AnnotationsManager::validate_annotation("title", "desc", 1000).is_err());
}

#[test]
fn test_key_events_primary_and_quotas() {
    let mut manager = KeyEventsManager::new(false); // Standard property
    assert_eq!(manager.max_key_events(), 30);

    let primary_cfg = KeyEventConfig {
        event_name: "purchase".into(),
        key_type: KeyEventType::Primary,
        counting_method: CountingMethod::OncePerEvent,
        default_value: Some(100.0),
    };
    assert!(manager.register_key_event(primary_cfg).is_ok());
    assert!(manager.is_primary("purchase"));

    let secondary_cfg = KeyEventConfig {
        event_name: "newsletter_signup".into(),
        key_type: KeyEventType::Secondary,
        counting_method: CountingMethod::OncePerSession,
        default_value: None,
    };
    assert!(manager.register_key_event(secondary_cfg).is_ok());
    assert!(!manager.is_primary("newsletter_signup"));
}

#[test]
fn test_user_provided_data_normalization() {
    // Gmail dots and alias stripping
    let h1 = UserProvidedDataNormalizer::normalize_and_hash_email("John.Doe+promo@gmail.com");
    let h2 = UserProvidedDataNormalizer::normalize_and_hash_email("johndoe@gmail.com");
    assert_eq!(h1, h2);

    // General domain preservation
    let h3 = UserProvidedDataNormalizer::normalize_and_hash_email("User.Name@company.com");
    let h4 = UserProvidedDataNormalizer::normalize_and_hash_email("username@company.com");
    assert_ne!(h3, h4);

    // Phone E.164 normalization
    let p1 = UserProvidedDataNormalizer::normalize_and_hash_phone("(555) 123-4567");
    let p2 = UserProvidedDataNormalizer::normalize_and_hash_phone("5551234567");
    assert_eq!(p1, p2);
}

#[test]
fn test_tag_diagnostics_rules_and_quality() {
    // Missing config tag -> Urgent
    let r1 = TagDiagnosticsEngine::evaluate_container(false, true, true, false, 0);
    assert_eq!(r1.status, TagQualityStatus::Urgent);
    assert!(r1.issues.iter().any(|i| i.rule_id == "MISSING_GOOGLE_TAG"));

    // Missing conversion linker with conversions -> Urgent
    let r2 = TagDiagnosticsEngine::evaluate_container(true, false, true, false, 0);
    assert_eq!(r2.status, TagQualityStatus::Urgent);
    assert!(r2.issues.iter().any(|i| i.rule_id == "MISSING_CONVERSION_LINKER"));

    // Duplicate config -> NeedsAttention
    let r3 = TagDiagnosticsEngine::evaluate_container(true, true, true, false, 2);
    assert_eq!(r3.status, TagQualityStatus::NeedsAttention);

    // Fully optimized -> Excellent
    let r4 = TagDiagnosticsEngine::evaluate_container(true, true, true, false, 1);
    assert_eq!(r4.status, TagQualityStatus::Excellent);
}
