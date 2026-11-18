use super::handlers_collect::AppState;
use crate::db::sea::{container_entities, SeaEntityRepo};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct EntityQuery {
    #[serde(rename = "type")]
    pub entity_type: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateEntityPayload {
    pub name: String,
    pub entity_type: String,
    #[serde(default)]
    pub data: serde_json::Value,
}

#[derive(Deserialize)]
pub struct UpdateEntityPayload {
    pub name: Option<String>,
    pub data: Option<serde_json::Value>,
}

#[derive(Deserialize)]
pub struct PublishPayload {
    pub container_id: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
}

pub async fn list_entities(
    State(state): State<Arc<AppState>>,
    Path(workspace_id): Path<String>,
    Query(query): Query<EntityQuery>,
) -> impl IntoResponse {
    match SeaEntityRepo::get_entities(&state.sea_db, &workspace_id, query.entity_type.as_deref()).await {
        Ok(entities) => Json(serde_json::to_value(entities).unwrap()).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn create_entity(
    State(state): State<Arc<AppState>>,
    Path(workspace_id): Path<String>,
    Json(payload): Json<CreateEntityPayload>,
) -> impl IntoResponse {
    let id = format!("ent_{}_{}", chrono::Utc::now().timestamp_millis(), &uuid_token(6));
    let fingerprint = uuid_token(8);
    let model = container_entities::Model {
        id,
        workspace_id,
        entity_type: payload.entity_type,
        name: payload.name,
        data_json: payload.data.to_string(),
        fingerprint,
    };

    match SeaEntityRepo::create_entity(&state.sea_db, model).await {
        Ok(entity) => (StatusCode::CREATED, Json(serde_json::to_value(entity).unwrap())).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn update_entity(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateEntityPayload>,
) -> impl IntoResponse {
    let data_str = payload.data.as_ref().map(|d| d.to_string());
    match SeaEntityRepo::update_entity(&state.sea_db, &id, payload.name, data_str).await {
        Ok(Some(updated)) => Json(serde_json::to_value(updated).unwrap()).into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Entity not found" })),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn delete_entity(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match SeaEntityRepo::delete_entity(&state.sea_db, &id).await {
        Ok(deleted) => Json(serde_json::json!({ "success": deleted })).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn publish_workspace(
    State(state): State<Arc<AppState>>,
    Path(workspace_id): Path<String>,
    Json(payload): Json<PublishPayload>,
) -> impl IntoResponse {
    let version_name = payload
        .name
        .unwrap_or_else(|| format!("Version {}", chrono::Utc::now().timestamp_millis()));

    match SeaEntityRepo::publish_workspace(
        &state.sea_db,
        &workspace_id,
        &version_name,
        payload.description,
    )
    .await
    {
        Ok(ver) => (StatusCode::CREATED, Json(serde_json::to_value(ver).unwrap())).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

pub async fn list_versions(
    State(state): State<Arc<AppState>>,
    Path(container_id): Path<String>,
) -> impl IntoResponse {
    match SeaEntityRepo::list_versions(&state.sea_db, &container_id).await {
        Ok(versions) => Json(serde_json::to_value(versions).unwrap()).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

fn uuid_token(len: usize) -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    (0..len)
        .map(|_| format!("{:x}", rng.gen_range(0..16)))
        .collect()
}
