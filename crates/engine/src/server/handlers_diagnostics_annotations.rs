use super::handlers_collect::AppState;
use crate::db::sea::{SeaAnnotationRepo, SeaEntityRepo};
use crate::ga4::{Annotation, AnnotationsManager};
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
    match SeaAnnotationRepo::list_annotations(&state.sea_db, &property_id).await {
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
    let current_list = SeaAnnotationRepo::list_annotations(&state.sea_db, &property_id)
        .await
        .unwrap_or_default();

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
    let annotation = Annotation {
        id,
        property_id,
        title: payload.title,
        description: payload.description,
        date: payload.date,
        color,
        created_at: chrono::Utc::now().timestamp_millis(),
    };

    match SeaAnnotationRepo::create_annotation(&state.sea_db, annotation).await {
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
    match SeaAnnotationRepo::delete_annotation(&state.sea_db, &id).await {
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
    let entities = SeaEntityRepo::get_entities(&state.sea_db, &container_id, None)
        .await
        .unwrap_or_default();

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
