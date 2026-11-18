use analytics_engine::anti_adblock::{CookieArmor, PathObfuscator, PayloadArmor, TransportResilience};
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

#[test]
fn test_path_obfuscator_custom_endpoints() {
    let (script, sync_path) = PathObfuscator::generate_cloaked_paths("GTM-XXXX", "secret_salt");
    assert!(script.ends_with("/app.js"));
    assert!(sync_path.ends_with("/sync"));
    assert!(!sync_path.contains("collect"));

    let (_, custom_path) = PathObfuscator::generate_cloaked_paths_with_action(
        "GTM-XXXX",
        "secret_salt",
        "telemetry_push",
    );
    assert!(custom_path.ends_with("/telemetry_push"));

    assert!(PathObfuscator::verify_cloaked_path(&sync_path, "GTM-XXXX", "secret_salt", None));
    assert!(PathObfuscator::verify_cloaked_path(
        &custom_path,
        "GTM-XXXX",
        "secret_salt",
        Some("telemetry_push")
    ));

    let token_action = PathObfuscator::extract_token_and_action(&sync_path);
    assert_eq!(token_action, Some((&sync_path[6..18], "sync")));
}

#[test]
fn test_payload_armor() {
    let raw = "v=2&tid=G-TEST&cid=123.456&en=purchase&epn.value=99.99";
    let key = 0x5a;
    let armored = PayloadArmor::disguise(raw, key);
    assert!(!armored.contains("purchase"));
    assert!(!armored.contains("G-TEST"));

    let revealed = PayloadArmor::reveal(&armored, key).unwrap();
    assert_eq!(revealed, raw);

    let query = format!("__d={}", armored);
    assert!(PayloadArmor::is_armored_query(&query));
    let unpacked = PayloadArmor::extract_and_unpack(&query, key);
    assert_eq!(unpacked, raw);
}

#[test]
fn test_cookie_armor() {
    let header = CookieArmor::generate_set_cookie_header("_fpid", "fpid.12345", Some("example.com"));
    assert!(header.contains("_fpid=fpid.12345"));
    assert!(header.contains("Max-Age=63072000"));
    assert!(header.contains("HttpOnly"));
    assert!(header.contains("SameSite=Lax"));
    assert!(header.contains("Domain=example.com"));

    let cookie_str = "_ga=GA1.1.999; _fpid=fpid.12345; session=abc";
    let extracted = CookieArmor::extract_cookie(cookie_str, "_fpid");
    assert_eq!(extracted, Some("fpid.12345"));

    let durable = CookieArmor::resolve_durable_client_id(Some(cookie_str), "_fpid", "fallback.cid");
    assert_eq!(durable, "fpid.12345");

    let fallback = CookieArmor::resolve_durable_client_id(None, "_fpid", "fallback.cid");
    assert_eq!(fallback, "fallback.cid");
}

#[test]
fn test_transport_resilience_custom_endpoint() {
    let gif = TransportResilience::transparent_gif_bytes();
    assert_eq!(&gif[0..6], b"GIF89a");
    assert_eq!(gif.len(), 43);

    let script = TransportResilience::client_transport_script("/api/v1/telemetry");
    assert!(script.contains("navigator.sendBeacon"));
    assert!(script.contains("fetch"));
    assert!(script.contains("?fmt=gif"));
}

#[tokio::test]
async fn test_http_custom_and_cloaked_endpoints() {
    let pool = DatabasePool::new_in_memory().unwrap();
    let repo = EventRepository::new(pool.clone());
    let state = Arc::new(AppState {
        repo,
        pool: Arc::new(pool.clone()),
    });
    let app = build_router(state);

    let raw = "v=2&tid=G-CUSTOM&cid=888.777&en=custom_lead";
    let armored = PayloadArmor::disguise(raw, 0x5a);

    // 1. Custom first-party endpoint without "collect" keyword
    let req = Request::builder()
        .method("POST")
        .uri(format!("/api/v1/telemetry?__d={}", armored))
        .body(Body::empty())
        .unwrap();
    let res = app.clone().oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);

    // 2. Cloaked endpoint with arbitrary action /_trk/tok123/sync
    let req_cloaked = Request::builder()
        .method("POST")
        .uri(format!("/_trk/tok123/sync?__d={}", armored))
        .body(Body::empty())
        .unwrap();
    let res_cloaked = app.clone().oneshot(req_cloaked).await.unwrap();
    assert_eq!(res_cloaked.status(), StatusCode::NO_CONTENT);

    let repo2 = EventRepository::new(pool);
    let events = repo2.get_recent_events("G-CUSTOM", 5).unwrap();
    assert_eq!(events.len(), 2);
    assert_eq!(events[0].event_name, "custom_lead");

    // 3. Pixel fallback on custom endpoint via ?fmt=gif
    let pixel_req = Request::builder()
        .method("GET")
        .uri("/api/v1/telemetry?fmt=gif&cid=888.777")
        .body(Body::empty())
        .unwrap();
    let pixel_res = app.oneshot(pixel_req).await.unwrap();
    assert_eq!(pixel_res.status(), StatusCode::OK);
    assert_eq!(pixel_res.headers().get("content-type").unwrap(), "image/gif");
    let cookie = pixel_res.headers().get("set-cookie").unwrap().to_str().unwrap();
    assert!(cookie.contains("_fpid=888.777"));
}
