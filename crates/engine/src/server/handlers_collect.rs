use crate::db::event_repo::EventRepository;
use crate::redaction::email::redact_emails;
use crate::wire::mp_validator::MpValidator;
use crate::wire::parser::WireParser;
use axum::{
    body::Bytes,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::collections::HashMap;
use std::sync::Arc;

pub struct AppState {
    pub repo: EventRepository,
}

pub async fn handle_g_collect(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
    body: Bytes,
) -> impl IntoResponse {
    let body_str = String::from_utf8_lossy(&body);
    let raw_payload = if !body_str.trim().is_empty() {
        body_str.to_string()
    } else {
        params
            .into_iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect::<Vec<_>>()
            .join("&")
    };

    let sanitized = redact_emails(&raw_payload);
    let events = WireParser::parse_query_hit(&sanitized);

    for ev in events {
        let property_id = ev
            .event_params
            .get("tid")
            .and_then(|v| v.as_str())
            .unwrap_or("default_prop")
            .to_string();

        let _ = state.repo.insert_event(&property_id, None, &ev);
    }

    StatusCode::NO_CONTENT
}

pub async fn handle_mp_collect(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let client_id = payload
        .get("client_id")
        .and_then(|v| v.as_str())
        .unwrap_or("anonymous");

    if let Some(events) = payload.get("events").and_then(|e| e.as_array()) {
        for ev_obj in events {
            let event_name = ev_obj.get("name").and_then(|v| v.as_str()).unwrap_or("unknown");
            let mut event = crate::wire::model::CanonicalEvent::default();
            event.event_name = event_name.to_string();
            event.client_id = client_id.to_string();
            event.is_conversion = event_name == "purchase";

            if let Some(params) = ev_obj.get("params").and_then(|p| p.as_object()) {
                for (k, v) in params {
                    event.event_params.insert(k.clone(), v.clone());
                }
            }

            let _ = state.repo.insert_event("default_prop", None, &event);
        }
    }

    StatusCode::NO_CONTENT
}

pub async fn handle_debug_mp_collect(
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let validation = MpValidator::validate(&payload);
    Json(validation)
}
