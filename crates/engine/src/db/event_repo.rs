use super::pool::DatabasePool;
use crate::wire::model::CanonicalEvent;
use rusqlite::{params, Result};

pub struct EventRepository {
    pool: DatabasePool,
}

impl EventRepository {
    pub fn new(pool: DatabasePool) -> Self {
        Self { pool }
    }

    pub fn insert_event(&self, property_id: &str, stream_id: Option<&str>, event: &CanonicalEvent) -> Result<i64> {
        let params_json = serde_json::to_string(&event.event_params).unwrap_or_else(|_| "{}".to_string());
        let user_props_json = serde_json::to_string(&event.user_properties).unwrap_or_else(|_| "{}".to_string());

        self.pool.with_conn(|conn| {
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
                    property_id,
                    stream_id,
                    event.client_id,
                    event.user_id,
                    event.session_id,
                    event.session_number,
                    event.event_name,
                    event.timestamp_micros,
                    params_json,
                    user_props_json,
                    event.consent_state,
                    event.consent_detail,
                    if event.is_conversion { 1 } else { 0 },
                    0,
                ],
            )?;
            Ok(conn.last_insert_rowid())
        })
    }

    pub fn get_recent_events(&self, property_id: &str, limit: usize) -> Result<Vec<CanonicalEvent>> {
        self.pool.with_conn(|conn| {
            let mut stmt = conn.prepare(
                r#"
                SELECT event_name, client_id, user_id, session_id, session_number,
                       timestamp_micros, event_params_json, user_properties_json,
                       consent_state, consent_detail, is_conversion
                FROM raw_events
                WHERE property_id = ?1
                ORDER BY timestamp_micros DESC
                LIMIT ?2
                "#,
            )?;

            let event_iter = stmt.query_map(params![property_id, limit as i64], |row| {
                let params_str: String = row.get(6)?;
                let props_str: Option<String> = row.get(7)?;
                let params = serde_json::from_str(&params_str).unwrap_or_default();
                let props = props_str.and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default();
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
                    event_params: params,
                    user_properties: props,
                    consent_state: row.get(8)?,
                    consent_detail: row.get(9)?,
                    is_conversion: is_conv == 1,
                })
            })?;

            let mut list = Vec::new();
            for item in event_iter {
                list.push(item?);
            }
            Ok(list)
        })
    }
}
