use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DatabaseEngine {
    Sqlite,
    Postgres,
    MySql,
    Mongo,
    Memory,
}

impl fmt::Display for DatabaseEngine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Sqlite => write!(f, "sqlite"),
            Self::Postgres => write!(f, "postgres"),
            Self::MySql => write!(f, "mysql"),
            Self::Mongo => write!(f, "mongo"),
            Self::Memory => write!(f, "memory"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub engine: DatabaseEngine,
    pub uri: String,
    pub host: Option<String>,
    pub port: Option<u16>,
    pub database: Option<String>,
    pub max_connections: u32,
    pub timeout_secs: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConnectorError {
    ConnectionFailed(String),
    QueryFailed(String),
    SchemaError(String),
    EntityNotFound(String),
    SerializationError(String),
    UnsupportedEngine(String),
    InvalidUri(String),
}

impl fmt::Display for ConnectorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::ConnectionFailed(msg) => write!(f, "Database connection error: {}", msg),
            Self::QueryFailed(msg) => write!(f, "Query execution error: {}", msg),
            Self::SchemaError(msg) => write!(f, "Schema initialization error: {}", msg),
            Self::EntityNotFound(msg) => write!(f, "Entity not found: {}", msg),
            Self::SerializationError(msg) => write!(f, "Data serialization error: {}", msg),
            Self::UnsupportedEngine(msg) => write!(f, "Unsupported database engine: {}", msg),
            Self::InvalidUri(msg) => write!(f, "Invalid database URI: {}", msg),
        }
    }
}

impl std::error::Error for ConnectorError {}

impl DatabaseConfig {
    pub fn from_uri(uri: &str) -> Result<Self, ConnectorError> {
        let trimmed = uri.trim();
        if trimmed.is_empty() || trimmed == ":memory:" || trimmed == "sqlite::memory:" {
            return Ok(Self {
                engine: DatabaseEngine::Memory,
                uri: ":memory:".to_string(),
                host: None,
                port: None,
                database: Some(":memory:".to_string()),
                max_connections: 5,
                timeout_secs: 10,
            });
        }

        let engine = if trimmed.starts_with("postgres://") || trimmed.starts_with("postgresql://") {
            DatabaseEngine::Postgres
        } else if trimmed.starts_with("mysql://") || trimmed.starts_with("mariadb://") {
            DatabaseEngine::MySql
        } else if trimmed.starts_with("mongodb://") || trimmed.starts_with("mongodb+srv://") {
            DatabaseEngine::Mongo
        } else if trimmed.starts_with("sqlite://") || trimmed.ends_with(".db") || trimmed.ends_with(".sqlite") {
            DatabaseEngine::Sqlite
        } else {
            return Err(ConnectorError::UnsupportedEngine(format!(
                "Cannot deduce database engine from URI: {}",
                uri
            )));
        };

        Ok(Self {
            engine,
            uri: trimmed.to_string(),
            host: extract_host(trimmed),
            port: extract_port(trimmed),
            database: extract_dbname(trimmed),
            max_connections: 10,
            timeout_secs: 15,
        })
    }
}

fn extract_host(uri: &str) -> Option<String> {
    if let Some(pos) = uri.find("://") {
        let rest = &uri[pos + 3..];
        let after_auth = rest.split('@').last().unwrap_or(rest);
        let host_part = after_auth.split('/').next()?.split(':').next()?;
        if !host_part.is_empty() {
            return Some(host_part.to_string());
        }
    }
    None
}

fn extract_port(uri: &str) -> Option<u16> {
    if let Some(pos) = uri.find("://") {
        let rest = &uri[pos + 3..];
        let after_auth = rest.split('@').last().unwrap_or(rest);
        let host_port = after_auth.split('/').next()?;
        if let Some(port_str) = host_port.split(':').nth(1) {
            return port_str.parse::<u16>().ok();
        }
    }
    None
}

fn extract_dbname(uri: &str) -> Option<String> {
    if let Some(pos) = uri.find("://") {
        let rest = &uri[pos + 3..];
        let after_auth = rest.split('@').last().unwrap_or(rest);
        if let Some(path) = after_auth.split('/').nth(1) {
            let db = path.split('?').next().unwrap_or(path);
            if !db.is_empty() {
                return Some(db.to_string());
            }
        }
    }
    None
}
