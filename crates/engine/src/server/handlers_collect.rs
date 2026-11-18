use crate::anti_adblock::{CookieArmor, PayloadArmor, TransportResilience};
use crate::db::event_repo::EventRepository;
use crate::db::pool::DbPool;
use crate::redaction::email::redact_emails;
use crate::wire::mp_validator::MpValidator;
use crate::wire::parser::WireParser;
use axum::{
    body::Bytes,
    extract::{Path, Query, State},
    http::{
        header::{CONTENT_TYPE, SET_COOKIE},
        HeaderMap, HeaderValue, StatusCode,
    },
    response::IntoResponse,
    Json,
};
use std::collections::HashMap;
use std::sync::Arc;

pub struct AppState {
    pub repo: EventRepository,
    pub pool: Arc<DbPool>,
    pub sea_db: sea_orm::DatabaseConnection,
}

fn extract_payload_string(body: &Bytes, params: &HashMap<String, String>) -> String {
    let body_str = String::from_utf8_lossy(body);
    if !body_str.trim().is_empty() {
        body_str.to_string()
    } else {
        params
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect::<Vec<_>>()
            .join("&")
    }
}

fn process_raw_hit(state: &AppState, mut raw: String) {
    if PayloadArmor::is_armored_query(&raw) {
        raw = PayloadArmor::extract_and_unpack(&raw, 0x5a);
    }
    let sanitized = redact_emails(&raw);
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
}

fn make_pixel_response(params: &HashMap<String, String>) -> impl IntoResponse {
    let fpid = params.get("cid").cloned().unwrap_or_else(|| {
        format!("{}.{}", chrono::Utc::now().timestamp_millis(), 100000000)
    });
    let cookie_val = CookieArmor::generate_set_cookie_header("_fpid", &fpid, None);
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("image/gif"));
    if let Ok(hv) = HeaderValue::from_str(&cookie_val) {
        headers.insert(SET_COOKIE, hv);
    }
    (StatusCode::OK, headers, TransportResilience::transparent_gif_bytes())
}

pub async fn handle_g_collect(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
    body: Bytes,
) -> impl IntoResponse {
    process_raw_hit(&state, extract_payload_string(&body, &params));
    StatusCode::NO_CONTENT.into_response()
}

pub async fn handle_cloaked_ingest(
    State(state): State<Arc<AppState>>,
    Path((_token, action)): Path<(String, String)>,
    Query(params): Query<HashMap<String, String>>,
    body: Bytes,
) -> impl IntoResponse {
    process_raw_hit(&state, extract_payload_string(&body, &params));
    if action.ends_with(".gif") || params.get("fmt").map(|s| s.as_str()) == Some("gif") {
        make_pixel_response(&params).into_response()
    } else {
        StatusCode::NO_CONTENT.into_response()
    }
}

pub async fn handle_custom_ingest(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HashMap<String, String>>,
    body: Bytes,
) -> impl IntoResponse {
    process_raw_hit(&state, extract_payload_string(&body, &params));
    if params.get("fmt").map(|s| s.as_str()) == Some("gif") {
        make_pixel_response(&params).into_response()
    } else {
        StatusCode::NO_CONTENT.into_response()
    }
}

pub async fn handle_cloaked_collect(
    State(state): State<Arc<AppState>>,
    Path(token): Path<String>,
    Query(params): Query<HashMap<String, String>>,
    body: Bytes,
) -> impl IntoResponse {
    handle_cloaked_ingest(State(state), Path((token, "collect".into())), Query(params), body).await
}

pub async fn handle_pixel_gif(
    Query(params): Query<HashMap<String, String>>,
) -> impl IntoResponse {
    make_pixel_response(&params)
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
    Json(MpValidator::validate(&payload))
}
