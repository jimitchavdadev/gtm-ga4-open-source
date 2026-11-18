use super::types::{ConnectorError, DatabaseEngine};
use crate::db::entity_repo::{GtmEntity, GtmVersion};
use crate::ga4::Annotation;
use crate::wire::model::CanonicalEvent;

pub trait DatabaseConnector: Send + Sync {
    /// Returns the database engine type (Sqlite, Postgres, MySql, Mongo, Memory)
    fn engine_type(&self) -> DatabaseEngine;

    /// Returns the active connection URI (with credentials redacted if present)
    fn connection_uri(&self) -> &str;

    /// Verifies live connectivity with the database instance
    fn ping(&self) -> Result<(), ConnectorError>;

    /// Bootstraps or migrates the schema for events, GTM entities, versions, and annotations
    fn init_schema(&self) -> Result<(), ConnectorError>;

    /// Ingests a canonical analytics hit into the events store
    fn insert_event(
        &self,
        property_id: &str,
        stream_id: Option<&str>,
        event: &CanonicalEvent,
    ) -> Result<i64, ConnectorError>;

    /// Queries the most recent events for a given property
    fn get_recent_events(
        &self,
        property_id: &str,
        limit: usize,
    ) -> Result<Vec<CanonicalEvent>, ConnectorError>;

    /// Inserts or updates a GTM entity (Tag, Trigger, Variable, Folder, Zone, Template)
    fn upsert_entity(&self, entity: &GtmEntity) -> Result<(), ConnectorError>;

    /// Retrieves GTM entities by workspace ID and optional entity type
    fn get_entities(
        &self,
        workspace_id: &str,
        entity_type: Option<&str>,
    ) -> Result<Vec<GtmEntity>, ConnectorError>;

    /// Deletes a GTM entity by primary identifier
    fn delete_entity(&self, id: &str) -> Result<bool, ConnectorError>;

    /// Persists a published container version snapshot
    fn save_version(&self, version: &GtmVersion) -> Result<(), ConnectorError>;

    /// Lists published container versions ordered by created_at descending
    fn get_versions(&self, container_id: &str) -> Result<Vec<GtmVersion>, ConnectorError>;

    /// Stores a GA4 property annotation
    fn save_annotation(&self, annotation: &Annotation) -> Result<(), ConnectorError>;

    /// Retrieves annotations for a property ordered by date descending
    fn get_annotations(&self, property_id: &str) -> Result<Vec<Annotation>, ConnectorError>;

    /// Removes an annotation by identifier
    fn delete_annotation(&self, id: &str) -> Result<bool, ConnectorError>;
}
