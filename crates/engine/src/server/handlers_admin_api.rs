use super::handlers_collect::AppState;
use crate::ga4_api::{
    AudienceExport, CustomDimension, DataStream, UserDeletionExecutor, UserDeletionRequest,
    WebStreamData,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

pub async fn handle_list_data_streams(
    Path(property_id): Path<String>,
) -> impl IntoResponse {
    let default_stream = DataStream {
        name: format!("properties/{}/dataStreams/stream_default", property_id),
        stream_type: "WEB_DATA_STREAM".into(),
        display_name: format!("Default Web Stream ({})", property_id),
        web_stream_data: Some(WebStreamData {
            measurement_id: if property_id.starts_with("G-") {
                property_id.clone()
            } else {
                format!("G-{}", property_id)
            },
            default_uri: Some("https://example.com".into()),
        }),
        app_stream_data: None,
        create_time: chrono::Utc::now().timestamp_millis(),
    };

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "dataStreams": [default_stream]
        })),
    )
}

pub async fn handle_create_custom_dimension(
    Path(property_id): Path<String>,
    Json(payload): Json<CustomDimension>,
) -> impl IntoResponse {
    let mut dimension = payload;
    dimension.name = format!(
        "properties/{}/customDimensions/{}",
        property_id, dimension.parameter_name
    );

    (StatusCode::CREATED, Json(dimension))
}

pub async fn handle_create_audience_export(
    Path(property_id): Path<String>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let audience = payload
        .get("audience")
        .and_then(|v| v.as_str())
        .unwrap_or("audiences/all_users");

    let export = AudienceExport {
        name: format!(
            "properties/{}/audienceExports/exp_{}",
            property_id,
            chrono::Utc::now().timestamp_millis()
        ),
        audience: audience.to_string(),
        state: "ACTIVE".into(),
        row_count: 1420,
        create_time: chrono::Utc::now().timestamp_millis(),
    };

    (StatusCode::CREATED, Json(export))
}

pub async fn handle_create_user_deletion(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let cid = payload.get("client_id").and_then(|v| v.as_str());
    let uid = payload.get("user_id").and_then(|v| v.as_str());

    match UserDeletionExecutor::purge_user_events(&state.pool, &property_id, cid, uid) {
        Ok(count) => {
            let req = UserDeletionRequest {
                name: format!(
                    "properties/{}/userDeletions/del_{}",
                    property_id,
                    chrono::Utc::now().timestamp_millis()
                ),
                user_id: uid.map(|s| s.to_string()),
                client_id: cid.map(|s| s.to_string()),
                request_time: chrono::Utc::now().timestamp_millis(),
                purged_events_count: count,
            };
            (StatusCode::OK, Json(serde_json::to_value(req).unwrap())).into_response()
        }
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": err })),
        )
            .into_response(),
    }
}
