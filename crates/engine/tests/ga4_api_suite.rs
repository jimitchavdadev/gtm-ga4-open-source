use analytics_engine::db::event_repo::EventRepository;
use analytics_engine::db::pool::DatabasePool;
use analytics_engine::server::handlers_collect::AppState;
use analytics_engine::server::routes::build_router;
use analytics_engine::wire::model::CanonicalEvent;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use std::sync::Arc;
use tower::ServiceExt;

async fn setup_app() -> (axum::Router, DatabasePool) {
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool.clone());
    let state = Arc::new(AppState {
        repo,
        pool: Arc::new(pool.clone()),
    });
    (build_router(state), pool)
}

#[tokio::test]
async fn test_data_api_run_report() {
    let (app, pool) = setup_app().await;
    let repo = EventRepository::new(pool);

    let mut ev1 = CanonicalEvent::default();
    ev1.event_name = "page_view".into();
    ev1.client_id = "c1".into();
    repo.insert_event("G-TEST", None, &ev1).unwrap();

    let mut ev2 = CanonicalEvent::default();
    ev2.event_name = "purchase".into();
    ev2.client_id = "c1".into();
    ev2.is_conversion = true;
    ev2.event_params.insert("value".into(), serde_json::json!(49.99));
    repo.insert_event("G-TEST", None, &ev2).unwrap();

    let body = serde_json::json!({
        "dimensions": [{ "name": "eventName" }],
        "metrics": [{ "name": "eventCount" }, { "name": "totalRevenue" }]
    });

    let req = Request::builder()
        .method("POST")
        .uri("/v1beta/properties/G-TEST/runReport")
        .header("content-type", "application/json")
        .body(Body::from(body.to_string()))
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["rowCount"], 2);
    let rows = json["rows"].as_array().unwrap();
    assert_eq!(rows.len(), 2);
}

#[tokio::test]
async fn test_data_api_realtime_and_batch() {
    let (app, pool) = setup_app().await;
    let repo = EventRepository::new(pool);

    let mut ev = CanonicalEvent::default();
    ev.event_name = "realtime_hit".into();
    ev.client_id = "c_rt".into();
    ev.timestamp_micros = chrono::Utc::now().timestamp_micros();
    repo.insert_event("G-RT", None, &ev).unwrap();

    // 1. Realtime Report
    let rt_req = Request::builder()
        .method("POST")
        .uri("/v1beta/properties/G-RT/runRealtimeReport")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::json!({
            "dimensions": [{ "name": "eventName" }],
            "metrics": [{ "name": "eventCount" }]
        }).to_string()))
        .unwrap();

    let rt_res = app.clone().oneshot(rt_req).await.unwrap();
    assert_eq!(rt_res.status(), StatusCode::OK);

    // 2. Batch Run Reports
    let batch_req = Request::builder()
        .method("POST")
        .uri("/v1beta/properties/G-RT/batchRunReports")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::json!({
            "requests": [{
                "dimensions": [{ "name": "eventName" }],
                "metrics": [{ "name": "eventCount" }]
            }]
        }).to_string()))
        .unwrap();

    let batch_res = app.oneshot(batch_req).await.unwrap();
    assert_eq!(batch_res.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_admin_api_and_user_deletion() {
    let (app, pool) = setup_app().await;
    let repo = EventRepository::new(pool.clone());

    let mut ev_del = CanonicalEvent::default();
    ev_del.event_name = "gdpr_event".into();
    ev_del.client_id = "user_purge_1".into();
    repo.insert_event("G-GDPR", None, &ev_del).unwrap();

    let mut ev_keep = CanonicalEvent::default();
    ev_keep.event_name = "keep_event".into();
    ev_keep.client_id = "user_keep_2".into();
    repo.insert_event("G-GDPR", None, &ev_keep).unwrap();

    // 1. Data Streams
    let stream_req = Request::builder()
        .method("GET")
        .uri("/v1beta/properties/G-GDPR/dataStreams")
        .body(Body::empty())
        .unwrap();
    let stream_res = app.clone().oneshot(stream_req).await.unwrap();
    assert_eq!(stream_res.status(), StatusCode::OK);

    // 2. Custom Dimensions
    let dim_req = Request::builder()
        .method("POST")
        .uri("/v1beta/properties/G-GDPR/customDimensions")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::json!({
            "name": "",
            "parameter_name": "author_id",
            "display_name": "Author Identifier",
            "scope": "EVENT"
        }).to_string()))
        .unwrap();
    let dim_res = app.clone().oneshot(dim_req).await.unwrap();
    assert_eq!(dim_res.status(), StatusCode::CREATED);

    // 3. Audience Export
    let aud_req = Request::builder()
        .method("POST")
        .uri("/v1beta/properties/G-GDPR/audienceExports")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::json!({
            "audience": "audiences/purchasers"
        }).to_string()))
        .unwrap();
    let aud_res = app.clone().oneshot(aud_req).await.unwrap();
    assert_eq!(aud_res.status(), StatusCode::CREATED);

    // 4. User Deletion (GDPR Right to be Forgotten)
    let del_req = Request::builder()
        .method("POST")
        .uri("/v1beta/properties/G-GDPR/userDeletions")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::json!({
            "client_id": "user_purge_1"
        }).to_string()))
        .unwrap();
    let del_res = app.oneshot(del_req).await.unwrap();
    assert_eq!(del_res.status(), StatusCode::OK);

    let remaining = repo.get_recent_events("G-GDPR", 10).unwrap();
    assert_eq!(remaining.len(), 1);
    assert_eq!(remaining[0].client_id, "user_keep_2");
}
