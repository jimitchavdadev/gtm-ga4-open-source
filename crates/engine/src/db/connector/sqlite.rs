use super::sqlite_entities::SqliteEntities;
use super::traits::DatabaseConnector;
use super::types::{ConnectorError, DatabaseEngine};
use crate::db::entity_repo::{GtmEntity, GtmVersion};
use crate::ga4::Annotation;
use crate::wire::model::CanonicalEvent;
use rusqlite::{params, Connection};
use std::sync::{Arc, Mutex};

pub struct SqliteConnector {
    uri: String,
    engine: DatabaseEngine,
    conn: Arc<Mutex<Connection>>,
}

impl SqliteConnector {
    pub fn new_in_memory() -> Result<Self, ConnectorError> {
        let conn = Connection::open_in_memory()
            .map_err(|e| ConnectorError::ConnectionFailed(e.to_string()))?;
        let connector = Self {
            uri: ":memory:".to_string(),
            engine: DatabaseEngine::Memory,
            conn: Arc::new(Mutex::new(conn)),
        };
        connector.init_schema()?;
        Ok(connector)
    }

    pub fn new_file(path: &str) -> Result<Self, ConnectorError> {
        let conn = Connection::open(path)
            .map_err(|e| ConnectorError::ConnectionFailed(e.to_string()))?;
        let connector = Self {
            uri: path.to_string(),
            engine: DatabaseEngine::Sqlite,
            conn: Arc::new(Mutex::new(conn)),
        };
        connector.init_schema()?;
        Ok(connector)
    }

    pub fn get_raw_conn(&self) -> Arc<Mutex<Connection>> {
        self.conn.clone()
    }
}

impl DatabaseConnector for SqliteConnector {
    fn engine_type(&self) -> DatabaseEngine {
        self.engine
    }

    fn connection_uri(&self) -> &str {
        &self.uri
    }

    fn ping(&self) -> Result<(), ConnectorError> {
        let conn = self.conn.lock().unwrap();
        conn.query_row("SELECT 1", [], |_| Ok(()))
            .map_err(|e| ConnectorError::QueryFailed(e.to_string()))
    }

    fn init_schema(&self) -> Result<(), ConnectorError> {
        let conn = self.conn.lock().unwrap();
        let sql = super::dialects::DialectHelper::get_create_tables_sql(self.engine);
        conn.execute_batch(sql)
            .map_err(|e| ConnectorError::SchemaError(e.to_string()))
    }

    fn insert_event(
        &self,
        property_id: &str,
        stream_id: Option<&str>,
        event: &CanonicalEvent,
    ) -> Result<i64, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        let params_json = serde_json::to_string(&event.event_params).unwrap_or_else(|_| "{}".into());
        let user_props_json = serde_json::to_string(&event.user_properties).unwrap_or_else(|_| "{}".into());

        conn.execute(
            r#"
            INSERT INTO raw_events (
                property_id, stream_id, client_id, user_id, session_id, session_number,
                event_name, timestamp_micros, event_params_json, user_properties_json,
                consent_state, consent_detail, is_conversion, is_modeled
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
            "#,
            params![
                property_id, stream_id, event.client_id, event.user_id, event.session_id,
                event.session_number, event.event_name, event.timestamp_micros,
                params_json, user_props_json, event.consent_state, event.consent_detail,
                if event.is_conversion { 1 } else { 0 }, 0
            ],
        ).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        Ok(conn.last_insert_rowid())
    }

    fn get_recent_events(
        &self,
        property_id: &str,
        limit: usize,
    ) -> Result<Vec<CanonicalEvent>, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            r#"
            SELECT event_name, client_id, user_id, session_id, session_number,
                   timestamp_micros, event_params_json, user_properties_json,
                   consent_state, consent_detail, is_conversion
            FROM raw_events WHERE property_id = ?1 ORDER BY timestamp_micros DESC LIMIT ?2
            "#,
        ).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;

        let rows = stmt.query_map(params![property_id, limit as i64], |row| {
            let params_str: String = row.get(6)?;
            let props_str: Option<String> = row.get(7)?;
            let is_conv: i64 = row.get(10)?;
            Ok(CanonicalEvent {
                event_name: row.get(0)?,
                client_id: row.get(1)?,
                user_id: row.get(2)?,
                session_id: row.get(3)?,
                session_number: row.get(4)?,
                engagement_time_msec: None,
                page_location: None,
                page_referrer: None,
                page_title: None,
                ip_override: None,
                user_agent: None,
                timestamp_micros: row.get(5)?,
                event_params: serde_json::from_str(&params_str).unwrap_or_default(),
                user_properties: props_str.and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default(),
                consent_state: row.get(8)?,
                consent_detail: row.get(9)?,
                is_conversion: is_conv == 1,
            })
        }).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r.map_err(|e| ConnectorError::QueryFailed(e.to_string()))?);
        }
        Ok(list)
    }

    fn upsert_entity(&self, entity: &GtmEntity) -> Result<(), ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::upsert_entity(&conn, entity)
    }

    fn get_entities(&self, workspace_id: &str, entity_type: Option<&str>) -> Result<Vec<GtmEntity>, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::get_entities(&conn, workspace_id, entity_type)
    }

    fn delete_entity(&self, id: &str) -> Result<bool, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::delete_entity(&conn, id)
    }

    fn save_version(&self, version: &GtmVersion) -> Result<(), ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::save_version(&conn, version)
    }

    fn get_versions(&self, container_id: &str) -> Result<Vec<GtmVersion>, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::get_versions(&conn, container_id)
    }

    fn save_annotation(&self, a: &Annotation) -> Result<(), ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::save_annotation(&conn, a)
    }

    fn get_annotations(&self, property_id: &str) -> Result<Vec<Annotation>, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::get_annotations(&conn, property_id)
    }

    fn delete_annotation(&self, id: &str) -> Result<bool, ConnectorError> {
        let conn = self.conn.lock().unwrap();
        SqliteEntities::delete_annotation(&conn, id)
    }
}
