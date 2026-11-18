use super::handlers_collect::AppState;
use super::handlers_diagnostics_annotations::get_tag_diagnostics;
use super::handlers_entities::{
    create_entity, delete_entity, list_entities, list_versions, publish_workspace, update_entity,
};
use axum::{
    routing::{get, post, put},
    Router,
};
use std::sync::Arc;

pub fn build_tagmanager_routes() -> Router<Arc<AppState>> {
    Router::new()
        // Custom First-Party Tag Manager Suite
        .route(
            "/api/v1/tag-manager/workspaces/{id}/entities",
            get(list_entities).post(create_entity),
        )
        .route(
            "/api/v1/tag-manager/entities/{id}",
            put(update_entity).delete(delete_entity),
        )
        .route(
            "/api/v1/tag-manager/workspaces/{id}/publish",
            post(publish_workspace),
        )
        .route(
            "/api/v1/tag-manager/containers/{id}/versions",
            get(list_versions),
        )
        .route(
            "/api/v1/tag-manager/containers/{id}/diagnostics",
            get(get_tag_diagnostics),
        )
        // Standard First-Party Paths
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
}
