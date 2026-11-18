use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GtmEntity {
    pub id: String,
    pub workspace_id: String,
    pub entity_type: String,
    pub name: String,
    pub data_json: String,
    pub fingerprint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GtmVersion {
    pub id: String,
    pub container_id: String,
    pub name: String,
    pub description: Option<String>,
    pub entities_json: String,
    pub created_at: i64,
}

#[derive(Clone)]
pub struct EntityRepository {
    conn: Arc<Mutex<Connection>>,
}

impl EntityRepository {
    pub fn new(conn: Arc<Mutex<Connection>>) -> Self {
        Self { conn }
    }

    pub fn get_entities(&self, workspace_id: &str, entity_type: Option<&str>) -> Result<Vec<GtmEntity>> {
        let conn = self.conn.lock().unwrap();
        let mut sql = "SELECT id, workspace_id, entity_type, name, data_json, fingerprint FROM gtm_entities WHERE workspace_id = ?1".to_string();
        if entity_type.is_some() {
            sql.push_str(" AND entity_type = ?2");
        }
        let mut stmt = conn.prepare(&sql)?;

        let rows = if let Some(et) = entity_type {
            stmt.query_map(params![workspace_id, et], Self::map_entity)?
        } else {
            stmt.query_map(params![workspace_id], Self::map_entity)?
        };

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }

    fn map_entity(row: &rusqlite::Row) -> Result<GtmEntity> {
        Ok(GtmEntity {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            entity_type: row.get(2)?,
            name: row.get(3)?,
            data_json: row.get(4)?,
            fingerprint: row.get(5)?,
        })
    }

    pub fn create_entity(&self, ent: &GtmEntity) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO gtm_entities (id, workspace_id, entity_type, name, data_json, fingerprint) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ent.id, ent.workspace_id, ent.entity_type, ent.name, ent.data_json, ent.fingerprint],
        )?;
        Ok(())
    }

    pub fn update_entity(&self, id: &str, name: Option<&str>, data_json: Option<&str>, fingerprint: &str) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let mut count = 0;
        if let (Some(n), Some(d)) = (name, data_json) {
            count = conn.execute(
                "UPDATE gtm_entities SET name = ?1, data_json = ?2, fingerprint = ?3 WHERE id = ?4",
                params![n, d, fingerprint, id],
            )?;
        } else if let Some(n) = name {
            count = conn.execute(
                "UPDATE gtm_entities SET name = ?1, fingerprint = ?2 WHERE id = ?3",
                params![n, fingerprint, id],
            )?;
        } else if let Some(d) = data_json {
            count = conn.execute(
                "UPDATE gtm_entities SET data_json = ?1, fingerprint = ?2 WHERE id = ?3",
                params![d, fingerprint, id],
            )?;
        }
        Ok(count > 0)
    }

    pub fn delete_entity(&self, id: &str) -> Result<bool> {
        let conn = self.conn.lock().unwrap();
        let count = conn.execute("DELETE FROM gtm_entities WHERE id = ?1", params![id])?;
        Ok(count > 0)
    }

    pub fn create_version(&self, id: &str, container_id: &str, name: &str, desc: Option<&str>, entities_json: &str) -> Result<GtmVersion> {
        let conn = self.conn.lock().unwrap();
        let now = chrono::Utc::now().timestamp_millis();
        conn.execute(
            "INSERT INTO gtm_versions (id, container_id, name, description, entities_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, container_id, name, desc, entities_json, now],
        )?;
        Ok(GtmVersion {
            id: id.to_string(),
            container_id: container_id.to_string(),
            name: name.to_string(),
            description: desc.map(|s| s.to_string()),
            entities_json: entities_json.to_string(),
            created_at: now,
        })
    }

    pub fn get_versions(&self, container_id: &str) -> Result<Vec<GtmVersion>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, container_id, name, description, entities_json, created_at FROM gtm_versions WHERE container_id = ?1 ORDER BY created_at DESC")?;
        let rows = stmt.query_map(params![container_id], |row| {
            Ok(GtmVersion {
                id: row.get(0)?,
                container_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                entities_json: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;

        let mut list = Vec::new();
        for r in rows {
            list.push(r?);
        }
        Ok(list)
    }
}
