use super::handlers_collect::{
    handle_cloaked_collect, handle_cloaked_ingest, handle_custom_ingest,
    handle_debug_mp_collect, handle_g_collect, handle_mp_collect, handle_pixel_gif,
    AppState,
};
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;

pub fn build_event_routes() -> Router<Arc<AppState>> {
    Router::new()
        // Custom First-Party Event Ingestion Endpoints
        .route(
            "/api/v1/events/collect",
            post(handle_g_collect).get(handle_g_collect),
        )
        .route("/api/v1/events/batch", post(handle_mp_collect))
        .route("/api/v1/events/validate", post(handle_debug_mp_collect))
        .route("/api/v1/events/pixel", get(handle_pixel_gif))
        .route(
            "/api/v1/events/ingest",
            post(handle_custom_ingest).get(handle_custom_ingest),
        )
        // Custom Anti-Adblock & Cloaked Transport Endpoints
        .route(
            "/api/v1/telemetry",
            post(handle_custom_ingest).get(handle_custom_ingest),
        )
        .route(
            "/api/v1/events",
            post(handle_custom_ingest).get(handle_custom_ingest),
        )
        .route(
            "/_trk/{token}/collect",
            post(handle_cloaked_collect).get(handle_cloaked_collect),
        )
        .route(
            "/_trk/{token}/{action}",
            post(handle_cloaked_ingest).get(handle_cloaked_ingest),
        )
        .route("/_trk/pixel.gif", get(handle_pixel_gif))
        // Backward-Compatible Legacy Aliases
        .route("/g/collect", post(handle_g_collect).get(handle_g_collect))
        .route("/mp/collect", post(handle_mp_collect))
        .route("/debug/mp/collect", post(handle_debug_mp_collect))
}
