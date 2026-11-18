use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanonicalEvent {
    pub event_name: String,
    pub client_id: String,
    pub user_id: Option<String>,
    pub session_id: Option<i64>,
    pub session_number: Option<i64>,
    pub engagement_time_msec: Option<i64>,
    pub page_location: Option<String>,
    pub page_referrer: Option<String>,
    pub page_title: Option<String>,
    pub ip_override: Option<String>,
    pub user_agent: Option<String>,
    pub timestamp_micros: i64,
    pub event_params: HashMap<String, serde_json::Value>,
    pub user_properties: HashMap<String, serde_json::Value>,
    pub consent_state: Option<String>, // gcs e.g. G111
    pub consent_detail: Option<String>, // gcd e.g. 1pqpq5
    pub is_conversion: bool,
}

impl Default for CanonicalEvent {
    fn default() -> Self {
        Self {
            event_name: "unknown_event".to_string(),
            client_id: "anonymous".to_string(),
            user_id: None,
            session_id: None,
            session_number: None,
            engagement_time_msec: None,
            page_location: None,
            page_referrer: None,
            page_title: None,
            ip_override: None,
            user_agent: None,
            timestamp_micros: chrono::Utc::now().timestamp_micros(),
            event_params: HashMap::new(),
            user_properties: HashMap::new(),
            consent_state: None,
            consent_detail: None,
            is_conversion: false,
        }
    }
}
