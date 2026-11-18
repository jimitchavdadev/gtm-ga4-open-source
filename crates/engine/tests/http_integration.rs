use analytics_engine::db::event_repo::EventRepository;
use analytics_engine::db::pool::DatabasePool;
use analytics_engine::db::sea::connect_sea_database;
use analytics_engine::server::handlers_collect::AppState;
use analytics_engine::server::routes::build_router;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use std::sync::Arc;
use tower::ServiceExt;

async fn create_test_state() -> (Arc<AppState>, DatabasePool) {
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool.clone());
    let sea_db = connect_sea_database("sqlite::memory:").await.unwrap();
    let state = Arc::new(AppState {
        repo,
        pool: Arc::new(pool.clone()),
        sea_db,
    });
    (state, pool)
}

#[tokio::test]
async fn test_http_healthz() {
    let (state, _) = create_test_state().await;
    let app = build_router(state);

    let req = Request::builder()
        .uri("/healthz")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_http_g_collect() {
    let (state, pool) = create_test_state().await;
    let app = build_router(state);

    let req = Request::builder()
        .method("POST")
        .uri("/g/collect?v=2&tid=G-TEST&cid=123.456&en=page_view&ep.email=user@test.com")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);

    let repo2 = EventRepository::new(pool);
    let events = repo2.get_recent_events("G-TEST", 5).unwrap();
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].event_name, "page_view");
}

#[tokio::test]
async fn test_http_reporting_identity_and_reports() {
    let (state, _) = create_test_state().await;
    let app = build_router(state);

    let req = Request::builder()
        .uri("/api/v1/properties/G-TEST/identity?mode=BLENDED")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_http_entities_crud_and_publish() {
    let (state, _) = create_test_state().await;
    let app = build_router(state);

    // Create Tag Entity
    let create_body = serde_json::json!({
        "name": "GA4 Config",
        "entity_type": "tag",
        "data": { "measurement_id": "G-XYZ123" }
    });
    let req = Request::builder()
        .method("POST")
        .uri("/api/v1/workspaces/ws_default/entities")
        .header("content-type", "application/json")
        .body(Body::from(create_body.to_string()))
        .unwrap();

    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);

    // List entities
    let list_req = Request::builder()
        .uri("/api/v1/workspaces/ws_default/entities")
        .body(Body::empty())
        .unwrap();
    let list_res = app.clone().oneshot(list_req).await.unwrap();
    assert_eq!(list_res.status(), StatusCode::OK);

    // Publish workspace
    let pub_body = serde_json::json!({
        "container_id": "ct_123",
        "name": "Prod Release v1.0",
        "description": "Initial setup"
    });
    let pub_req = Request::builder()
        .method("POST")
        .uri("/api/v1/workspaces/ws_default/publish")
        .header("content-type", "application/json")
        .body(Body::from(pub_body.to_string()))
        .unwrap();
    let pub_res = app.oneshot(pub_req).await.unwrap();
    assert_eq!(pub_res.status(), StatusCode::CREATED);
}
