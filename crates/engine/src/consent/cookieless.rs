use super::types::{ConsentSettings, ConsentStatus};
use crate::wire::model::CanonicalEvent;

pub struct CookielessManager;

impl CookielessManager {
    /// Determines whether an event is an unconsented cookieless ping
    pub fn is_cookieless_ping(event: &CanonicalEvent, consent: &ConsentSettings) -> bool {
        if consent.analytics_storage == ConsentStatus::Denied {
            return true;
        }
        if let Some(gcs) = &event.consent_state {
            if gcs.ends_with('0') {
                return true;
            }
        }
        event.client_id.starts_with("ephemeral_") || event.client_id == "anonymous"
    }

    /// Generates a randomized ephemeral session identifier for unconsented traffic
    /// This allows short-window aggregation without writing cookies or tracking across sessions
    pub fn generate_ephemeral_id(page_token: Option<&str>) -> String {
        let ts = chrono::Utc::now().timestamp_millis();
        let token = page_token.unwrap_or("rand");
        format!("ephemeral_{}_{}", ts, token)
    }

    /// Strips persistent cookies and user ID when consent is denied
    pub fn sanitize_cookieless_event(mut event: CanonicalEvent) -> CanonicalEvent {
        event.user_id = None;
        if !event.client_id.starts_with("ephemeral_") {
            event.client_id = Self::generate_ephemeral_id(None);
        }
        event
    }
}
