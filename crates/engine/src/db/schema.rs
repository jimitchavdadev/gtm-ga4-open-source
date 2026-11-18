use rusqlite::{Connection, Result};

pub fn init_database(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;

        CREATE TABLE IF NOT EXISTS ga4_properties (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            reporting_identity_mode TEXT DEFAULT 'BLENDED',
            is_360 INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ga4_data_streams (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL,
            stream_type TEXT NOT NULL,
            measurement_id TEXT NOT NULL,
            api_secret TEXT,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS raw_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_id TEXT NOT NULL,
            stream_id TEXT,
            client_id TEXT NOT NULL,
            user_id TEXT,
            session_id INTEGER,
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

        CREATE INDEX IF NOT EXISTS idx_events_prop_ts ON raw_events (property_id, timestamp_micros);
        CREATE INDEX IF NOT EXISTS idx_events_client ON raw_events (client_id);
        CREATE INDEX IF NOT EXISTS idx_events_user ON raw_events (user_id);
        CREATE INDEX IF NOT EXISTS idx_events_name ON raw_events (event_name);

        CREATE TABLE IF NOT EXISTS gtm_accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS gtm_containers (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            name TEXT NOT NULL,
            usage_context TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS gtm_workspaces (
            id TEXT PRIMARY KEY,
            container_id TEXT NOT NULL,
            name TEXT NOT NULL,
            is_default INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL
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
        "#,
    )?;
    Ok(())
}
