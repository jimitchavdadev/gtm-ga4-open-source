use super::types::ConnectorError;
use crate::db::entity_repo::{GtmEntity, GtmVersion};
use crate::ga4::Annotation;
use rusqlite::{params, Connection};

pub struct SqliteEntities;

impl SqliteEntities {
    pub fn upsert_entity(conn: &Connection, entity: &GtmEntity) -> Result<(), ConnectorError> {
        conn.execute(
            r#"
            INSERT INTO gtm_entities (id, workspace_id, entity_type, name, data_json, fingerprint)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name, data_json=excluded.data_json, fingerprint=excluded.fingerprint
            "#,
            params![entity.id, entity.workspace_id, entity.entity_type, entity.name, entity.data_json, entity.fingerprint],
        ).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        Ok(())
    }

    pub fn get_entities(conn: &Connection, workspace_id: &str, entity_type: Option<&str>) -> Result<Vec<GtmEntity>, ConnectorError> {
        let mut sql = "SELECT id, workspace_id, entity_type, name, data_json, fingerprint FROM gtm_entities WHERE workspace_id = ?1".to_string();
        if entity_type.is_some() { sql.push_str(" AND entity_type = ?2"); }
        let mut stmt = conn.prepare(&sql).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        let rows = if let Some(et) = entity_type {
            stmt.query_map(params![workspace_id, et], Self::map_entity)
        } else {
            stmt.query_map(params![workspace_id], Self::map_entity)
        }.map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;

        let mut list = Vec::new();
        for r in rows { list.push(r.map_err(|e| ConnectorError::QueryFailed(e.to_string()))?); }
        Ok(list)
    }

    fn map_entity(r: &rusqlite::Row) -> rusqlite::Result<GtmEntity> {
        Ok(GtmEntity {
            id: r.get(0)?, workspace_id: r.get(1)?, entity_type: r.get(2)?,
            name: r.get(3)?, data_json: r.get(4)?, fingerprint: r.get(5)?,
        })
    }

    pub fn delete_entity(conn: &Connection, id: &str) -> Result<bool, ConnectorError> {
        let count = conn.execute("DELETE FROM gtm_entities WHERE id = ?1", params![id])
            .map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        Ok(count > 0)
    }

    pub fn save_version(conn: &Connection, version: &GtmVersion) -> Result<(), ConnectorError> {
        conn.execute(
            "INSERT INTO gtm_versions (id, container_id, name, description, entities_json, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![version.id, version.container_id, version.name, version.description, version.entities_json, version.created_at],
        ).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        Ok(())
    }

    pub fn get_versions(conn: &Connection, container_id: &str) -> Result<Vec<GtmVersion>, ConnectorError> {
        let mut stmt = conn.prepare("SELECT id, container_id, name, description, entities_json, created_at FROM gtm_versions WHERE container_id = ?1 ORDER BY created_at DESC")
            .map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        let rows = stmt.query_map(params![container_id], |r| Ok(GtmVersion {
            id: r.get(0)?, container_id: r.get(1)?, name: r.get(2)?,
            description: r.get(3)?, entities_json: r.get(4)?, created_at: r.get(5)?,
        })).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        let mut list = Vec::new();
        for r in rows { list.push(r.map_err(|e| ConnectorError::QueryFailed(e.to_string()))?); }
        Ok(list)
    }

    pub fn save_annotation(conn: &Connection, a: &Annotation) -> Result<(), ConnectorError> {
        conn.execute(
            "INSERT INTO annotations (id, property_id, title, description, date, color, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![a.id, a.property_id, a.title, a.description, a.date, a.color, a.created_at],
        ).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        Ok(())
    }

    pub fn get_annotations(conn: &Connection, property_id: &str) -> Result<Vec<Annotation>, ConnectorError> {
        let mut stmt = conn.prepare("SELECT id, property_id, title, description, date, color, created_at FROM annotations WHERE property_id = ?1 ORDER BY date DESC")
            .map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        let rows = stmt.query_map(params![property_id], |r| Ok(Annotation {
            id: r.get(0)?, property_id: r.get(1)?, title: r.get(2)?,
            description: r.get(3)?, date: r.get(4)?, color: r.get(5)?, created_at: r.get(6)?,
        })).map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        let mut list = Vec::new();
        for r in rows { list.push(r.map_err(|e| ConnectorError::QueryFailed(e.to_string()))?); }
        Ok(list)
    }

    pub fn delete_annotation(conn: &Connection, id: &str) -> Result<bool, ConnectorError> {
        let count = conn.execute("DELETE FROM annotations WHERE id = ?1", params![id])
            .map_err(|e| ConnectorError::QueryFailed(e.to_string()))?;
        Ok(count > 0)
    }
}
