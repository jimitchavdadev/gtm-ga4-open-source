use analytics_engine::db::event_repo::EventRepository;
use analytics_engine::db::pool::DatabasePool;
use analytics_engine::server::handlers_collect::AppState;
use analytics_engine::server::routes::build_router;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use std::sync::Arc;
use tower::ServiceExt;

#[tokio::test]
async fn test_http_healthz() {
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool);
    let state = Arc::new(AppState { repo });
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
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool.clone());
    let state = Arc::new(AppState { repo });
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
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool);
    let state = Arc::new(AppState { repo });
    let app = build_router(state);

    let req = Request::builder()
        .uri("/api/v1/properties/G-TEST/identity?mode=BLENDED")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let req_attr = Request::builder()
        .uri("/api/v1/properties/G-TEST/reports/attribution")
        .body(Body::empty())
        .unwrap();

    let res_attr = build_router(Arc::new(AppState { repo: EventRepository::new(DatabasePool::new_in_memory().unwrap()) }))
        .oneshot(req_attr)
        .await
        .unwrap();
    assert_eq!(res_attr.status(), StatusCode::OK);
}
