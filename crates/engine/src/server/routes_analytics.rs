use super::handlers_admin_api::{
    handle_create_audience_export, handle_create_custom_dimension, handle_create_user_deletion,
    handle_list_data_streams,
};
use super::handlers_collect::AppState;
use super::handlers_data_api::{
    handle_batch_run_reports, handle_run_realtime_report, handle_run_report,
};
use super::handlers_diagnostics_annotations::{
    create_annotation, delete_annotation, list_annotations,
};
use super::handlers_identity::handle_get_identity_mode;
use super::handlers_reports::{
    handle_attribution_report, handle_bigquery_export, handle_exploration_report,
    handle_funnel_report, handle_realtime,
};
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;

pub fn build_analytics_routes() -> Router<Arc<AppState>> {
    Router::new()
        // Custom First-Party Analytics Reporting Suite
        .route(
            "/api/v1/analytics/properties/{id}/reports",
            post(handle_run_report),
        )
        .route(
            "/api/v1/analytics/properties/{id}/realtime",
            get(handle_realtime).post(handle_run_realtime_report),
        )
        .route(
            "/api/v1/analytics/properties/{id}/reports/batch",
            post(handle_batch_run_reports),
        )
        .route(
            "/api/v1/analytics/properties/{id}/reports/attribution",
            get(handle_attribution_report),
        )
        .route(
            "/api/v1/analytics/properties/{id}/reports/funnel",
            get(handle_funnel_report),
        )
        .route(
            "/api/v1/analytics/properties/{id}/reports/explorations/{technique}",
            get(handle_exploration_report),
        )
        .route(
            "/api/v1/analytics/properties/{id}/export/bigquery",
            get(handle_bigquery_export),
        )
        .route(
            "/api/v1/analytics/properties/{id}/annotations",
            get(list_annotations).post(create_annotation),
        )
        .route(
            "/api/v1/analytics/annotations/{id}",
            axum::routing::delete(delete_annotation),
        )
        .route(
            "/api/v1/analytics/properties/{id}/identity",
            get(handle_get_identity_mode),
        )
        // Custom First-Party Analytics Admin Suite
        .route(
            "/api/v1/admin/properties/{id}/streams",
            get(handle_list_data_streams),
        )
        .route(
            "/api/v1/admin/properties/{id}/definitions/dimensions",
            post(handle_create_custom_dimension),
        )
        .route(
            "/api/v1/admin/properties/{id}/audiences/exports",
            post(handle_create_audience_export),
        )
        .route(
            "/api/v1/admin/properties/{id}/privacy/user-deletion",
            post(handle_create_user_deletion),
        )
        // Standard First-Party Paths
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
        // Backward-Compatible Legacy Google Data & Admin APIs
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
}
