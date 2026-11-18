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

async fn setup_app() -> axum::Router {
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool.clone());
    let sea_db = connect_sea_database("sqlite::memory:").await.unwrap();
    let state = Arc::new(AppState {
        repo,
        pool: Arc::new(pool),
        sea_db,
    });
    build_router(state)
}

#[tokio::test]
async fn test_custom_event_ingestion_and_validation() {
    let app = setup_app().await;

    // 1. /api/v1/events/collect
    let req = Request::builder()
        .method("POST")
        .uri("/api/v1/events/collect?tid=PROP_CUSTOM&cid=client_001&en=custom_click")
        .body(Body::empty())
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);

    // 2. /api/v1/events/batch
    let batch_payload = serde_json::json!({
        "client_id": "client_002",
        "events": [{ "name": "purchase", "params": { "value": 99.0 } }]
    });
    let batch_req = Request::builder()
        .method("POST")
        .uri("/api/v1/events/batch")
        .header("content-type", "application/json")
        .body(Body::from(batch_payload.to_string()))
        .unwrap();
    let batch_res = app.clone().oneshot(batch_req).await.unwrap();
    assert_eq!(batch_res.status(), StatusCode::NO_CONTENT);

    // 3. /api/v1/events/validate
    let val_req = Request::builder()
        .method("POST")
        .uri("/api/v1/events/validate")
        .header("content-type", "application/json")
        .body(Body::from(batch_payload.to_string()))
        .unwrap();
    let val_res = app.oneshot(val_req).await.unwrap();
    assert_eq!(val_res.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_custom_analytics_and_tagmanager_routes() {
    let app = setup_app().await;

    // 1. /api/v1/analytics/properties/prop_1/realtime
    let rt_req = Request::builder()
        .uri("/api/v1/analytics/properties/prop_1/realtime")
        .body(Body::empty())
        .unwrap();
    let rt_res = app.clone().oneshot(rt_req).await.unwrap();
    assert_eq!(rt_res.status(), StatusCode::OK);

    // 2. /api/v1/analytics/properties/prop_1/reports/attribution
    let attr_req = Request::builder()
        .uri("/api/v1/analytics/properties/prop_1/reports/attribution")
        .body(Body::empty())
        .unwrap();
    let attr_res = app.clone().oneshot(attr_req).await.unwrap();
    assert_eq!(attr_res.status(), StatusCode::OK);

    // 3. /api/v1/tag-manager/workspaces/ws_default/entities
    let tag_payload = serde_json::json!({
        "name": "Custom Ingestion Tag",
        "entity_type": "tag",
        "data": { "endpoint": "/api/v1/events/collect" }
    });
    let tm_req = Request::builder()
        .method("POST")
        .uri("/api/v1/tag-manager/workspaces/ws_default/entities")
        .header("content-type", "application/json")
        .body(Body::from(tag_payload.to_string()))
        .unwrap();
    let tm_res = app.clone().oneshot(tm_req).await.unwrap();
    assert_eq!(tm_res.status(), StatusCode::CREATED);

    // 4. /api/v1/tag-manager/containers/ct_1/diagnostics
    let diag_req = Request::builder()
        .uri("/api/v1/tag-manager/containers/ct_1/diagnostics")
        .body(Body::empty())
        .unwrap();
    let diag_res = app.oneshot(diag_req).await.unwrap();
    assert_eq!(diag_res.status(), StatusCode::OK);
}
