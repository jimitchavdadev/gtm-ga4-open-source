use super::handlers_collect::{handle_debug_mp_collect, handle_g_collect, handle_mp_collect, AppState};
use super::handlers_identity::handle_get_identity_mode;
use super::handlers_reports::{handle_attribution_report, handle_exploration_report, handle_funnel_report, handle_realtime};
use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

pub fn build_router(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/healthz", get(healthz))
        .route("/g/collect", post(handle_g_collect).get(handle_g_collect))
        .route("/mp/collect", post(handle_mp_collect))
        .route("/debug/mp/collect", post(handle_debug_mp_collect))
        .route("/api/v1/properties/{id}/identity", get(handle_get_identity_mode))
        .route("/api/v1/properties/{id}/realtime", get(handle_realtime))
        .route("/api/v1/properties/{id}/reports/attribution", get(handle_attribution_report))
        .route("/api/v1/properties/{id}/reports/funnel", get(handle_funnel_report))
        .route("/api/v1/properties/{id}/reports/explorations/{technique}", get(handle_exploration_report))
        .layer(cors)
        .with_state(state)
}

async fn healthz() -> impl IntoResponse {
    (StatusCode::OK, Json(serde_json::json!({ "status": "ok", "engine": "rust-axum" })))
}
