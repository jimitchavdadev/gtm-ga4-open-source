use super::handlers_admin_api::{
    handle_create_audience_export, handle_create_custom_dimension, handle_create_user_deletion,
    handle_list_data_streams,
};
use super::handlers_collect::{
    handle_cloaked_collect, handle_cloaked_ingest, handle_custom_ingest,
    handle_debug_mp_collect, handle_g_collect, handle_mp_collect, handle_pixel_gif,
    AppState,
};
use super::handlers_data_api::{
    handle_batch_run_reports, handle_run_realtime_report, handle_run_report,
};
use super::handlers_diagnostics_annotations::{
    create_annotation, delete_annotation, get_tag_diagnostics, list_annotations,
};
use super::handlers_entities::{
    create_entity, delete_entity, list_entities, list_versions, publish_workspace, update_entity,
};
use super::handlers_identity::handle_get_identity_mode;
use super::handlers_reports::{
    handle_attribution_report, handle_bigquery_export, handle_exploration_report,
    handle_funnel_report, handle_realtime,
};
use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, put},
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
        .route("/mp/collect", post(handle_mp_collect))
        .route("/debug/mp/collect", post(handle_debug_mp_collect))
        .route(
            "/api/v1/workspaces/{id}/entities",
            get(list_entities).post(create_entity),
        )
        .route(
            "/api/v1/entities/{id}",
            put(update_entity).delete(delete_entity),
        )
        .route(
            "/api/v1/workspaces/{id}/publish",
            post(publish_workspace),
        )
        .route(
            "/api/v1/containers/{id}/versions",
            get(list_versions),
        )
        .route(
            "/api/v1/containers/{id}/diagnostics",
            get(get_tag_diagnostics),
        )
        .route(
            "/api/v1/properties/{id}/identity",
            get(handle_get_identity_mode),
        )
        .route("/api/v1/properties/{id}/realtime", get(handle_realtime))
        .route(
            "/api/v1/properties/{id}/reports/attribution",
            get(handle_attribution_report),
        )
        .route(
            "/api/v1/properties/{id}/reports/funnel",
            get(handle_funnel_report),
        )
        .route(
            "/api/v1/properties/{id}/reports/explorations/{technique}",
            get(handle_exploration_report),
        )
        .route(
            "/api/v1/properties/{id}/export/bigquery",
            get(handle_bigquery_export),
        )
        .route(
            "/api/v1/properties/{id}/annotations",
            get(list_annotations).post(create_annotation),
        )
        .route(
            "/api/v1/annotations/{id}",
            axum::routing::delete(delete_annotation),
        )
        .route(
            "/v1beta/properties/{id}/runReport",
            post(handle_run_report),
        )
        .route(
            "/v1beta/properties/{id}/runRealtimeReport",
            post(handle_run_realtime_report),
        )
        .route(
            "/v1beta/properties/{id}/batchRunReports",
            post(handle_batch_run_reports),
        )
        .route(
            "/v1beta/properties/{id}/dataStreams",
            get(handle_list_data_streams),
        )
        .route(
            "/v1beta/properties/{id}/customDimensions",
            post(handle_create_custom_dimension),
        )
        .route(
            "/v1beta/properties/{id}/audienceExports",
            post(handle_create_audience_export),
        )
        .route(
            "/v1beta/properties/{id}/userDeletions",
            post(handle_create_user_deletion),
        )
        .layer(cors)
        .with_state(state)
}

async fn healthz() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(serde_json::json!({ "status": "ok", "engine": "rust-axum" })),
    )
}
