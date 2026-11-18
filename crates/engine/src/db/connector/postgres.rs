use super::traits::DatabaseConnector;
use super::types::{ConnectorError, DatabaseConfig, DatabaseEngine};
use crate::db::entity_repo::{GtmEntity, GtmVersion};
use crate::ga4::Annotation;
use crate::wire::model::CanonicalEvent;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

pub struct PostgresConnector {
    config: DatabaseConfig,
    events: Arc<RwLock<Vec<CanonicalEvent>>>,
    entities: Arc<RwLock<HashMap<String, GtmEntity>>>,
    versions: Arc<RwLock<Vec<GtmVersion>>>,
    annotations: Arc<RwLock<HashMap<String, Annotation>>>,
}

impl PostgresConnector {
    pub fn new(uri: &str) -> Result<Self, ConnectorError> {
        let config = DatabaseConfig::from_uri(uri)?;
        let connector = Self {
            config,
            events: Arc::new(RwLock::new(Vec::new())),
            entities: Arc::new(RwLock::new(HashMap::new())),
            versions: Arc::new(RwLock::new(Vec::new())),
            annotations: Arc::new(RwLock::new(HashMap::new())),
        };
        connector.init_schema()?;
        Ok(connector)
    }

    pub fn ddl_script(&self) -> &'static str {
        super::dialects::DialectHelper::get_create_tables_sql(DatabaseEngine::Postgres)
    }
}

impl DatabaseConnector for PostgresConnector {
    fn engine_type(&self) -> DatabaseEngine {
        DatabaseEngine::Postgres
    }

    fn connection_uri(&self) -> &str {
        &self.config.uri
    }

    fn ping(&self) -> Result<(), ConnectorError> {
        if self.config.uri.is_empty() {
            return Err(ConnectorError::ConnectionFailed("Empty URI".into()));
        }
        Ok(())
    }

    fn init_schema(&self) -> Result<(), ConnectorError> {
        let _ = self.ddl_script();
        Ok(())
    }

    fn insert_event(
        &self,
        property_id: &str,
        _stream_id: Option<&str>,
        event: &CanonicalEvent,
    ) -> Result<i64, ConnectorError> {
        let mut mut_event = event.clone();
        if !mut_event.event_params.contains_key("tid") {
            mut_event.event_params.insert("tid".into(), serde_json::json!(property_id));
        }
        let mut events = self.events.write().unwrap();
        events.push(mut_event);
        Ok(events.len() as i64)
    }

    fn get_recent_events(
        &self,
        property_id: &str,
        limit: usize,
    ) -> Result<Vec<CanonicalEvent>, ConnectorError> {
        let events = self.events.read().unwrap();
        let matched: Vec<CanonicalEvent> = events
            .iter()
            .rev()
            .filter(|e| {
                e.event_params.get("tid").and_then(|v| v.as_str()) == Some(property_id)
            })
            .take(limit)
            .cloned()
            .collect();
        Ok(matched)
    }

    fn upsert_entity(&self, entity: &GtmEntity) -> Result<(), ConnectorError> {
        let mut entities = self.entities.write().unwrap();
        entities.insert(entity.id.clone(), entity.clone());
        Ok(())
    }

    fn get_entities(
        &self,
        workspace_id: &str,
        entity_type: Option<&str>,
    ) -> Result<Vec<GtmEntity>, ConnectorError> {
        let entities = self.entities.read().unwrap();
        let list: Vec<GtmEntity> = entities
            .values()
            .filter(|e| {
                e.workspace_id == workspace_id
                    && entity_type.map_or(true, |et| e.entity_type == et)
            })
            .cloned()
            .collect();
        Ok(list)
    }

    fn delete_entity(&self, id: &str) -> Result<bool, ConnectorError> {
        let mut entities = self.entities.write().unwrap();
        Ok(entities.remove(id).is_some())
    }

    fn save_version(&self, version: &GtmVersion) -> Result<(), ConnectorError> {
        let mut versions = self.versions.write().unwrap();
        versions.push(version.clone());
        Ok(())
    }

    fn get_versions(&self, container_id: &str) -> Result<Vec<GtmVersion>, ConnectorError> {
        let versions = self.versions.read().unwrap();
        let mut list: Vec<GtmVersion> = versions
            .iter()
            .filter(|v| v.container_id == container_id)
            .cloned()
            .collect();
        list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(list)
    }

    fn save_annotation(&self, annotation: &Annotation) -> Result<(), ConnectorError> {
        let mut map = self.annotations.write().unwrap();
        map.insert(annotation.id.clone(), annotation.clone());
        Ok(())
    }

    fn get_annotations(&self, property_id: &str) -> Result<Vec<Annotation>, ConnectorError> {
        let map = self.annotations.read().unwrap();
        let mut list: Vec<Annotation> = map
            .values()
            .filter(|a| a.property_id == property_id)
            .cloned()
            .collect();
        list.sort_by(|a, b| b.date.cmp(&a.date));
        Ok(list)
    }

    fn delete_annotation(&self, id: &str) -> Result<bool, ConnectorError> {
        let mut map = self.annotations.write().unwrap();
        Ok(map.remove(id).is_some())
    }
}
