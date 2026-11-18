use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserActivityEvent {
    pub timestamp_micros: i64,
    pub event_name: String,
    pub page_location: Option<String>,
    pub params_json: String,
    pub is_conversion: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserProfileSummary {
    pub client_or_user_id: String,
    pub first_seen_timestamp: i64,
    pub last_seen_timestamp: i64,
    pub total_sessions: u64,
    pub total_events: usize,
    pub total_revenue: f64,
    pub events: Vec<UserActivityEvent>,
}

pub struct UserExplorerEngine;

impl UserExplorerEngine {
    pub fn build_profile(id: &str, mut events: Vec<UserActivityEvent>) -> UserProfileSummary {
        events.sort_by(|a, b| a.timestamp_micros.cmp(&b.timestamp_micros));
        let total_events = events.len();
        let first_seen = events.first().map(|e| e.timestamp_micros).unwrap_or(0);
        let last_seen = events.last().map(|e| e.timestamp_micros).unwrap_or(0);
        let mut total_rev = 0.0;

        for ev in &events {
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&ev.params_json) {
                if let Some(rev) = v.get("value").and_then(|val| val.as_f64()) {
                    total_rev += rev;
                }
            }
        }

        UserProfileSummary {
            client_or_user_id: id.to_string(),
            first_seen_timestamp: first_seen,
            last_seen_timestamp: last_seen,
            total_sessions: 1,
            total_events,
            total_revenue: total_rev,
            events,
        }
    }
}
