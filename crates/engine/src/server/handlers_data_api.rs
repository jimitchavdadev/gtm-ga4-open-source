use super::handlers_collect::AppState;
use crate::ga4_api::{
    BatchRunReportsRequest, BatchRunReportsResponse, DataApiExecutor, RunRealtimeReportRequest,
    RunReportRequest,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

pub async fn handle_run_report(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
    Json(payload): Json<RunReportRequest>,
) -> impl IntoResponse {
    let events = state
        .repo
        .get_recent_events(&property_id, 10000)
        .unwrap_or_default();

    let response = DataApiExecutor::execute_report(&events, &payload);
    (StatusCode::OK, Json(response))
}

pub async fn handle_run_realtime_report(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
    Json(payload): Json<RunRealtimeReportRequest>,
) -> impl IntoResponse {
    let now_micros = chrono::Utc::now().timestamp_micros();
    let thirty_mins_ago = now_micros - 30 * 60 * 1_000_000;

    let events = state
        .repo
        .get_recent_events(&property_id, 5000)
        .unwrap_or_default();

    let realtime_events: Vec<_> = events
        .into_iter()
        .filter(|e| e.timestamp_micros >= thirty_mins_ago)
        .collect();

    let report_req = RunReportRequest {
        date_ranges: None,
        dimensions: payload.dimensions,
        metrics: payload.metrics,
        limit: payload.limit,
        offset: None,
    };

    let response = DataApiExecutor::execute_report(&realtime_events, &report_req);
    (StatusCode::OK, Json(response))
}

pub async fn handle_batch_run_reports(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
    Json(payload): Json<BatchRunReportsRequest>,
) -> impl IntoResponse {
    let events = state
        .repo
        .get_recent_events(&property_id, 10000)
        .unwrap_or_default();

    let mut reports = Vec::new();
    for req in payload.requests.iter().take(5) {
        let resp = DataApiExecutor::execute_report(&events, req);
        reports.push(resp);
    }

    (
        StatusCode::OK,
        Json(BatchRunReportsResponse { reports }),
    )
}
