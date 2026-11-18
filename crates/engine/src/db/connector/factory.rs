use super::mongo::MongoConnector;
use super::mysql::MySqlConnector;
use super::postgres::PostgresConnector;
use super::sqlite::SqliteConnector;
use super::traits::DatabaseConnector;
use super::types::{ConnectorError, DatabaseConfig, DatabaseEngine};
use std::sync::Arc;

pub struct ConnectorFactory;

impl ConnectorFactory {
    /// Creates a concrete DatabaseConnector based on the connection URI scheme
    /// Supports:
    /// - SQLite: `sqlite::memory:`, `sqlite://path/to/db.sqlite`, `/path/to/db.sqlite`
    /// - PostgreSQL: `postgres://user:pass@host:5432/db` or `postgresql://`
    /// - MySQL: `mysql://user:pass@host:3306/db` or `mariadb://`
    /// - MongoDB: `mongodb://user:pass@host:27017/db` or `mongodb+srv://`
    pub fn create_connector(uri: &str) -> Result<Arc<dyn DatabaseConnector>, ConnectorError> {
        let config = DatabaseConfig::from_uri(uri)?;
        match config.engine {
            DatabaseEngine::Memory => {
                let conn = SqliteConnector::new_in_memory()?;
                Ok(Arc::new(conn))
            }
            DatabaseEngine::Sqlite => {
                let path = uri.strip_prefix("sqlite://").unwrap_or(uri);
                let conn = SqliteConnector::new_file(path)?;
                Ok(Arc::new(conn))
            }
            DatabaseEngine::Postgres => {
                let conn = PostgresConnector::new(uri)?;
                Ok(Arc::new(conn))
            }
            DatabaseEngine::MySql => {
                let conn = MySqlConnector::new(uri)?;
                Ok(Arc::new(conn))
            }
            DatabaseEngine::Mongo => {
                let conn = MongoConnector::new(uri)?;
                Ok(Arc::new(conn))
            }
        }
    }

    /// Automatically detects connection string from DATABASE_URL env or falls back to in-memory
    pub fn create_from_env() -> Result<Arc<dyn DatabaseConnector>, ConnectorError> {
        let uri = std::env::var("DATABASE_URL").unwrap_or_else(|_| ":memory:".to_string());
        Self::create_connector(&uri)
    }
}
