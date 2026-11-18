use super::handlers_collect::AppState;
use crate::db::{EntityRepository, GtmEntity};
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
    let repo = EntityRepository::new(state.pool.conn.clone());
    match repo.get_entities(&workspace_id, query.entity_type.as_deref()) {
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
    let repo = EntityRepository::new(state.pool.conn.clone());
    let id = format!("ent_{}_{}", chrono::Utc::now().timestamp_millis(), &uuid_token(6));
    let fingerprint = uuid_token(8);
    let entity = GtmEntity {
        id,
        workspace_id,
        entity_type: payload.entity_type,
        name: payload.name,
        data_json: payload.data.to_string(),
        fingerprint,
    };

    match repo.create_entity(&entity) {
        Ok(_) => (StatusCode::CREATED, Json(serde_json::to_value(entity).unwrap())).into_response(),
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
    let repo = EntityRepository::new(state.pool.conn.clone());
    let data_str = payload.data.as_ref().map(|d| d.to_string());
    let fingerprint = uuid_token(8);

    match repo.update_entity(&id, payload.name.as_deref(), data_str.as_deref(), &fingerprint) {
        Ok(updated) => Json(serde_json::json!({ "success": updated })).into_response(),
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
    let repo = EntityRepository::new(state.pool.conn.clone());
    match repo.delete_entity(&id) {
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
    let repo = EntityRepository::new(state.pool.conn.clone());
    let entities = match repo.get_entities(&workspace_id, None) {
        Ok(list) => list,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": e.to_string() })),
            )
                .into_response()
        }
    };

    let container_id = payload.container_id.unwrap_or_else(|| "default_container".to_string());
    let name = payload
        .name
        .unwrap_or_else(|| format!("Version {}", chrono::Utc::now().timestamp_millis()));
    let version_id = format!("ver_{}", chrono::Utc::now().timestamp_millis());
    let entities_json = serde_json::to_string(&entities).unwrap_or_else(|_| "[]".to_string());

    match repo.create_version(
        &version_id,
        &container_id,
        &name,
        payload.description.as_deref(),
        &entities_json,
    ) {
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
    let repo = EntityRepository::new(state.pool.conn.clone());
    match repo.get_versions(&container_id) {
        Ok(versions) => Json(serde_json::to_value(versions).unwrap()).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": e.to_string() })),
        )
            .into_response(),
    }
}

fn uuid_token(len: usize) -> String {
    use sha2::{Digest, Sha256};
    let seed = format!("{}_{}", chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0), len);
    let hash = format!("{:x}", Sha256::digest(seed.as_bytes()));
    hash[..len].to_string()
}
