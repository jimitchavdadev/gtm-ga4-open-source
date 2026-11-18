use super::handlers_collect::AppState;
use crate::db::EntityRepository;
use crate::ga4::AnnotationsManager;
use crate::gtm::TagDiagnosticsEngine;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct CreateAnnotationPayload {
    pub title: String,
    pub description: String,
    pub date: String,
    pub color: Option<String>,
}

pub async fn list_annotations(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
) -> impl IntoResponse {
    let repo = EntityRepository::new(state.pool.conn.clone());
    match repo.get_annotations(&property_id) {
        Ok(list) => Json(serde_json::to_value(list).unwrap()).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn create_annotation(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
    Json(payload): Json<CreateAnnotationPayload>,
) -> impl IntoResponse {
    let repo = EntityRepository::new(state.pool.conn.clone());
    let current_list = repo.get_annotations(&property_id).unwrap_or_default();

    if let Err(err) = AnnotationsManager::validate_annotation(
        &payload.title,
        &payload.description,
        current_list.len(),
    ) {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": err })),
        )
            .into_response();
    }

    let id = format!("ann_{}", chrono::Utc::now().timestamp_millis());
    let color = payload.color.unwrap_or_else(|| "#1a73e8".to_string());

    match repo.create_annotation(
        &id,
        &property_id,
        &payload.title,
        &payload.description,
        &payload.date,
        &color,
    ) {
        Ok(ann) => (StatusCode::CREATED, Json(serde_json::to_value(ann).unwrap())).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn delete_annotation(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let repo = EntityRepository::new(state.pool.conn.clone());
    match repo.delete_annotation(&id) {
        Ok(deleted) => Json(serde_json::json!({ "success": deleted })).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn get_tag_diagnostics(
    State(state): State<Arc<AppState>>,
    Path(container_id): Path<String>,
) -> impl IntoResponse {
    let repo = EntityRepository::new(state.pool.conn.clone());
    let entities = repo.get_entities(&container_id, None).unwrap_or_default();

    let has_config = entities.iter().any(|e| {
        e.entity_type == "tag" && e.data_json.contains("GA4 Configuration")
    });
    let has_conversion_linker = entities.iter().any(|e| {
        e.entity_type == "tag" && e.data_json.contains("Conversion Linker")
    });
    let has_conversions = entities.iter().any(|e| {
        e.entity_type == "tag" && e.data_json.contains("purchase")
    });
    let has_legacy = entities.iter().any(|e| {
        e.entity_type == "tag" && (e.data_json.contains("ua_") || e.data_json.contains("Universal Analytics"))
    });

    let report = TagDiagnosticsEngine::evaluate_container(
        has_config,
        has_conversion_linker,
        has_conversions,
        has_legacy,
        1,
    );

    Json(serde_json::to_value(report).unwrap())
}
