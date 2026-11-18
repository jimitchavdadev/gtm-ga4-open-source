use super::types::DatabaseEngine;

pub struct DialectHelper;

impl DialectHelper {
    /// Generates table initialization DDL tailored for the specific database engine
    pub fn get_create_tables_sql(engine: DatabaseEngine) -> &'static str {
        match engine {
            DatabaseEngine::Postgres => {
                r#"
                CREATE TABLE IF NOT EXISTS raw_events (
                    id BIGSERIAL PRIMARY KEY,
                    property_id VARCHAR(128) NOT NULL,
                    stream_id VARCHAR(128),
                    client_id VARCHAR(256) NOT NULL,
                    user_id VARCHAR(256),
                    session_id VARCHAR(128),
                    session_number BIGINT,
                    event_name VARCHAR(128) NOT NULL,
                    timestamp_micros BIGINT NOT NULL,
                    event_params_json JSONB NOT NULL,
                    user_properties_json JSONB,
                    consent_state VARCHAR(64),
                    consent_detail VARCHAR(64),
                    is_conversion SMALLINT DEFAULT 0,
                    is_modeled SMALLINT DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS gtm_entities (
                    id VARCHAR(128) PRIMARY KEY,
                    workspace_id VARCHAR(128) NOT NULL,
                    entity_type VARCHAR(64) NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    data_json JSONB NOT NULL,
                    fingerprint VARCHAR(128) NOT NULL
                );
                CREATE TABLE IF NOT EXISTS gtm_versions (
                    id VARCHAR(128) PRIMARY KEY,
                    container_id VARCHAR(128) NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    description TEXT,
                    entities_json JSONB NOT NULL,
                    created_at BIGINT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS annotations (
                    id VARCHAR(128) PRIMARY KEY,
                    property_id VARCHAR(128) NOT NULL,
                    title VARCHAR(128) NOT NULL,
                    description TEXT NOT NULL,
                    date VARCHAR(32) NOT NULL,
                    color VARCHAR(32) NOT NULL,
                    created_at BIGINT NOT NULL
                );
                "#
            }
            DatabaseEngine::MySql => {
                r#"
                CREATE TABLE IF NOT EXISTS raw_events (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    property_id VARCHAR(128) NOT NULL,
                    stream_id VARCHAR(128),
                    client_id VARCHAR(256) NOT NULL,
                    user_id VARCHAR(256),
                    session_id VARCHAR(128),
                    session_number BIGINT,
                    event_name VARCHAR(128) NOT NULL,
                    timestamp_micros BIGINT NOT NULL,
                    event_params_json JSON NOT NULL,
                    user_properties_json JSON,
                    consent_state VARCHAR(64),
                    consent_detail VARCHAR(64),
                    is_conversion TINYINT DEFAULT 0,
                    is_modeled TINYINT DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS gtm_entities (
                    id VARCHAR(128) PRIMARY KEY,
                    workspace_id VARCHAR(128) NOT NULL,
                    entity_type VARCHAR(64) NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    data_json JSON NOT NULL,
                    fingerprint VARCHAR(128) NOT NULL
                );
                CREATE TABLE IF NOT EXISTS gtm_versions (
                    id VARCHAR(128) PRIMARY KEY,
                    container_id VARCHAR(128) NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    description TEXT,
                    entities_json JSON NOT NULL,
                    created_at BIGINT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS annotations (
                    id VARCHAR(128) PRIMARY KEY,
                    property_id VARCHAR(128) NOT NULL,
                    title VARCHAR(128) NOT NULL,
                    description TEXT NOT NULL,
                    date VARCHAR(32) NOT NULL,
                    color VARCHAR(32) NOT NULL,
                    created_at BIGINT NOT NULL
                );
                "#
            }
            _ => {
                r#"
                CREATE TABLE IF NOT EXISTS raw_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    property_id TEXT NOT NULL,
                    stream_id TEXT,
                    client_id TEXT NOT NULL,
                    user_id TEXT,
                    session_id TEXT,
                    session_number INTEGER,
                    event_name TEXT NOT NULL,
                    timestamp_micros INTEGER NOT NULL,
                    event_params_json TEXT NOT NULL,
                    user_properties_json TEXT,
                    consent_state TEXT,
                    consent_detail TEXT,
                    is_conversion INTEGER DEFAULT 0,
                    is_modeled INTEGER DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS gtm_entities (
                    id TEXT PRIMARY KEY,
                    workspace_id TEXT NOT NULL,
                    entity_type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    fingerprint TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS gtm_versions (
                    id TEXT PRIMARY KEY,
                    container_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT,
                    entities_json TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );
                CREATE TABLE IF NOT EXISTS annotations (
                    id TEXT PRIMARY KEY,
                    property_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    date TEXT NOT NULL,
                    color TEXT NOT NULL,
                    created_at INTEGER NOT NULL
                );
                "#
            }
        }
    }

    /// Formats placeholder indices according to SQL dialect
    pub fn format_placeholder(engine: DatabaseEngine, index: usize) -> String {
        match engine {
            DatabaseEngine::Postgres => format!("${}", index),
            _ => "?".to_string(),
        }
    }
}
