use super::handlers_collect::AppState;
use super::routes_analytics::build_analytics_routes;
use super::routes_events::build_event_routes;
use super::routes_tagmanager::build_tagmanager_routes;
use axum::{http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

pub fn build_router(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/healthz", get(healthz))
        .merge(build_event_routes())
        .merge(build_analytics_routes())
        .merge(build_tagmanager_routes())
        .layer(cors)
        .with_state(state)
}

async fn healthz() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(serde_json::json!({ "status": "ok", "engine": "rust-axum" })),
    )
}
