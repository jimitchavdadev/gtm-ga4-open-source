use analytics_engine::db::event_repo::EventRepository;
use analytics_engine::db::pool::DatabasePool;
use analytics_engine::server::handlers_collect::AppState;
use analytics_engine::server::routes::build_router;
use std::net::SocketAddr;
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    let db_path = std::env::var("DATABASE_PATH").unwrap_or_else(|_| "analytics.db".to_string());
    let pool = DatabasePool::new_file(&db_path)?;
    let repo = EventRepository::new(pool);
    let state = Arc::new(AppState { repo });

    let app = build_router(state);

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("🚀 Rust High-Performance Analytics Core running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
