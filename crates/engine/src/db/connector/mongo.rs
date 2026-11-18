use super::traits::DatabaseConnector;
use super::types::{ConnectorError, DatabaseConfig, DatabaseEngine};
use crate::db::entity_repo::{GtmEntity, GtmVersion};
use crate::ga4::Annotation;
use crate::wire::model::CanonicalEvent;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

pub struct MongoConnector {
    config: DatabaseConfig,
    collections: Arc<RwLock<HashMap<String, Vec<Value>>>>,
}

impl MongoConnector {
    pub fn new(uri: &str) -> Result<Self, ConnectorError> {
        let config = DatabaseConfig::from_uri(uri)?;
        let mut cols = HashMap::new();
        for name in &["events", "gtm_entities", "gtm_versions", "annotations"] {
            cols.insert(name.to_string(), Vec::new());
        }
        let connector = Self { config, collections: Arc::new(RwLock::new(cols)) };
        connector.init_schema()?;
        Ok(connector)
    }
}

impl DatabaseConnector for MongoConnector {
    fn engine_type(&self) -> DatabaseEngine {
        DatabaseEngine::Mongo
    }

    fn connection_uri(&self) -> &str {
        &self.config.uri
    }

    fn ping(&self) -> Result<(), ConnectorError> {
        if self.config.uri.is_empty() {
            return Err(ConnectorError::ConnectionFailed("Empty MongoDB URI".into()));
        }
        Ok(())
    }

    fn init_schema(&self) -> Result<(), ConnectorError> {
        let mut cols = self.collections.write().unwrap();
        for name in &["events", "gtm_entities", "gtm_versions", "annotations"] {
            cols.entry(name.to_string()).or_insert_with(Vec::new);
        }
        Ok(())
    }

    fn insert_event(
        &self,
        property_id: &str,
        stream_id: Option<&str>,
        event: &CanonicalEvent,
    ) -> Result<i64, ConnectorError> {
        let mut doc = serde_json::to_value(event)
            .map_err(|e| ConnectorError::SerializationError(e.to_string()))?;
        if let Some(obj) = doc.as_object_mut() {
            obj.insert("property_id".into(), serde_json::json!(property_id));
            if let Some(s) = stream_id {
                obj.insert("stream_id".into(), serde_json::json!(s));
            }
        }
        let mut cols = self.collections.write().unwrap();
        let events = cols.get_mut("events").unwrap();
        events.push(doc);
        Ok(events.len() as i64)
    }

    fn get_recent_events(&self, prop_id: &str, limit: usize) -> Result<Vec<CanonicalEvent>, ConnectorError> {
        let cols = self.collections.read().unwrap();
        let events = cols.get("events").unwrap();
        let mut matched = Vec::new();
        for doc in events.iter().rev() {
            if doc.get("property_id").and_then(|v| v.as_str()) == Some(prop_id) {
                if let Ok(ev) = serde_json::from_value::<CanonicalEvent>(doc.clone()) {
                    matched.push(ev);
                    if matched.len() >= limit { break; }
                }
            }
        }
        Ok(matched)
    }

    fn upsert_entity(&self, entity: &GtmEntity) -> Result<(), ConnectorError> {
        let doc = serde_json::to_value(entity)
            .map_err(|e| ConnectorError::SerializationError(e.to_string()))?;
        let mut cols = self.collections.write().unwrap();
        let entities = cols.get_mut("gtm_entities").unwrap();
        entities.retain(|e| e.get("id").and_then(|v| v.as_str()) != Some(&entity.id));
        entities.push(doc);
        Ok(())
    }

    fn get_entities(
        &self,
        workspace_id: &str,
        entity_type: Option<&str>,
    ) -> Result<Vec<GtmEntity>, ConnectorError> {
        let cols = self.collections.read().unwrap();
        let entities = cols.get("gtm_entities").unwrap();
        let mut list = Vec::new();
        for doc in entities {
            if doc.get("workspace_id").and_then(|v| v.as_str()) == Some(workspace_id) {
                if let Some(et) = entity_type {
                    if doc.get("entity_type").and_then(|v| v.as_str()) != Some(et) {
                        continue;
                    }
                }
                if let Ok(ent) = serde_json::from_value::<GtmEntity>(doc.clone()) {
                    list.push(ent);
                }
            }
        }
        Ok(list)
    }

    fn delete_entity(&self, id: &str) -> Result<bool, ConnectorError> {
        let mut cols = self.collections.write().unwrap();
        let entities = cols.get_mut("gtm_entities").unwrap();
        let initial_len = entities.len();
        entities.retain(|e| e.get("id").and_then(|v| v.as_str()) != Some(id));
        Ok(entities.len() < initial_len)
    }

    fn save_version(&self, version: &GtmVersion) -> Result<(), ConnectorError> {
        let doc = serde_json::to_value(version)
            .map_err(|e| ConnectorError::SerializationError(e.to_string()))?;
        let mut cols = self.collections.write().unwrap();
        cols.get_mut("gtm_versions").unwrap().push(doc);
        Ok(())
    }

    fn get_versions(&self, container_id: &str) -> Result<Vec<GtmVersion>, ConnectorError> {
        let cols = self.collections.read().unwrap();
        let versions = cols.get("gtm_versions").unwrap();
        let mut list = Vec::new();
        for doc in versions {
            if doc.get("container_id").and_then(|v| v.as_str()) == Some(container_id) {
                if let Ok(v) = serde_json::from_value::<GtmVersion>(doc.clone()) {
                    list.push(v);
                }
            }
        }
        list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(list)
    }

    fn save_annotation(&self, annotation: &Annotation) -> Result<(), ConnectorError> {
        let doc = serde_json::to_value(annotation)
            .map_err(|e| ConnectorError::SerializationError(e.to_string()))?;
        let mut cols = self.collections.write().unwrap();
        let annos = cols.get_mut("annotations").unwrap();
        annos.retain(|a| a.get("id").and_then(|v| v.as_str()) != Some(&annotation.id));
        annos.push(doc);
        Ok(())
    }

    fn get_annotations(&self, property_id: &str) -> Result<Vec<Annotation>, ConnectorError> {
        let cols = self.collections.read().unwrap();
        let annos = cols.get("annotations").unwrap();
        let mut list = Vec::new();
        for doc in annos {
            if doc.get("property_id").and_then(|v| v.as_str()) == Some(property_id) {
                if let Ok(a) = serde_json::from_value::<Annotation>(doc.clone()) {
                    list.push(a);
                }
            }
        }
        list.sort_by(|a, b| b.date.cmp(&a.date));
        Ok(list)
    }

    fn delete_annotation(&self, id: &str) -> Result<bool, ConnectorError> {
        let mut cols = self.collections.write().unwrap();
        let annos = cols.get_mut("annotations").unwrap();
        let initial_len = annos.len();
        annos.retain(|a| a.get("id").and_then(|v| v.as_str()) != Some(id));
        Ok(annos.len() < initial_len)
    }
}
