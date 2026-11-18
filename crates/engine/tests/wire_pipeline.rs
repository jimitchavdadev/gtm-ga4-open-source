use analytics_engine::crypto::fpid::FpidManager;
use analytics_engine::crypto::hash::sha256_hex;
use analytics_engine::pipeline::executor::PipelineExecutor;
use analytics_engine::pipeline::rules::{PipelineAction, PipelineRule};
use analytics_engine::redaction::email::redact_emails;
use analytics_engine::redaction::query::strip_sensitive_params;
use analytics_engine::wire::mp_validator::MpValidator;
use analytics_engine::wire::parser::WireParser;

#[test]
fn test_wire_parser_and_redaction() {
    let wire = "v=2&tid=G-TEST&cid=123.456&en=page_view&ep.email=test@example.com&ep.auth=sec123";
    let redacted = redact_emails(wire);
    assert!(!redacted.contains("test@example.com"));
    assert!(redacted.contains("(redacted)"));

    let events = WireParser::parse_query_hit(&redacted);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].event_name, "page_view");
    assert_eq!(events[0].client_id, "123.456");

    let stripped = strip_sensitive_params("https://app.com/pay?token=xyz&id=1", &["token"]);
    assert_eq!(stripped, "https://app.com/pay?id=1");
}

#[test]
fn test_fpid_encryption() {
    let mgr = FpidManager::new(None);
    let fpid = FpidManager::generate_fpid();
    assert!(fpid.starts_with("FPID2."));

    let encrypted = mgr.encrypt(&fpid).expect("Encryption failed");
    let decrypted = mgr.decrypt(&encrypted).expect("Decryption failed");
    assert_eq!(decrypted, fpid);
}

#[test]
fn test_pipeline_executor() {
    let mut exec = PipelineExecutor::new();
    exec.add_rule(PipelineRule {
        id: "r1".into(),
        priority: 10,
        action: PipelineAction::Blocklist,
        target_fields: vec!["secret".into()],
        augment_data: None,
    });
    exec.add_rule(PipelineRule {
        id: "r2".into(),
        priority: 5,
        action: PipelineAction::HashSha256,
        target_fields: vec!["client_id".into()],
        augment_data: None,
    });

    let mut event = analytics_engine::wire::model::CanonicalEvent::default();
    event.client_id = "cid_raw".into();
    event.event_params.insert("secret".into(), serde_json::json!("classified"));

    let transformed = exec.execute(event);
    assert_eq!(transformed.client_id, sha256_hex("cid_raw"));
    assert!(!transformed.event_params.contains_key("secret"));
}

#[test]
fn test_measurement_protocol_validation() {
    let valid_payload = serde_json::json!({
        "client_id": "123.456",
        "events": [{
            "name": "purchase",
            "params": { "currency": "USD", "value": 99.5 }
        }]
    });
    let res = MpValidator::validate(&valid_payload);
    assert!(res.validation_messages.is_empty());

    let invalid_payload = serde_json::json!({
        "events": [{
            "name": "purchase",
            "params": {}
        }]
    });
    let res_inv = MpValidator::validate(&invalid_payload);
    assert!(!res_inv.validation_messages.is_empty());
}
