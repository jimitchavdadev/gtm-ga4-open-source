use analytics_engine::db::connector::{
    ConnectorFactory, DatabaseConfig, DatabaseEngine, DialectHelper,
};
use analytics_engine::db::entity_repo::{GtmEntity, GtmVersion};
use analytics_engine::ga4::Annotation;
use analytics_engine::wire::model::CanonicalEvent;

#[test]
fn test_database_config_parsing() {
    let pg_cfg = DatabaseConfig::from_uri("postgres://admin:secret@pg.internal:5432/analytics_db").unwrap();
    assert_eq!(pg_cfg.engine, DatabaseEngine::Postgres);
    assert_eq!(pg_cfg.host, Some("pg.internal".into()));
    assert_eq!(pg_cfg.port, Some(5432));
    assert_eq!(pg_cfg.database, Some("analytics_db".into()));

    let my_cfg = DatabaseConfig::from_uri("mysql://root@mysql.internal:3306/prod_ga4").unwrap();
    assert_eq!(my_cfg.engine, DatabaseEngine::MySql);
    assert_eq!(my_cfg.port, Some(3306));

    let mg_cfg = DatabaseConfig::from_uri("mongodb://mongo.internal:27017/telemetry").unwrap();
    assert_eq!(mg_cfg.engine, DatabaseEngine::Mongo);

    let mem_cfg = DatabaseConfig::from_uri(":memory:").unwrap();
    assert_eq!(mem_cfg.engine, DatabaseEngine::Memory);
}

#[test]
fn test_dialect_sql_generation() {
    let pg_sql = DialectHelper::get_create_tables_sql(DatabaseEngine::Postgres);
    assert!(pg_sql.contains("BIGSERIAL PRIMARY KEY"));
    assert!(pg_sql.contains("JSONB NOT NULL"));

    let my_sql = DialectHelper::get_create_tables_sql(DatabaseEngine::MySql);
    assert!(my_sql.contains("AUTO_INCREMENT PRIMARY KEY"));
    assert!(my_sql.contains("JSON NOT NULL"));

    let sq_sql = DialectHelper::get_create_tables_sql(DatabaseEngine::Sqlite);
    assert!(sq_sql.contains("AUTOINCREMENT"));
    assert!(sq_sql.contains("TEXT NOT NULL"));
}

#[test]
fn test_sqlite_connector_lifecycle() {
    let connector = ConnectorFactory::create_connector(":memory:").unwrap();
    assert_eq!(connector.engine_type(), DatabaseEngine::Memory);
    assert!(connector.ping().is_ok());

    let mut event = CanonicalEvent::default();
    event.event_name = "sqlite_event".into();
    event.client_id = "cid1".into();
    let row_id = connector.insert_event("G-SQLITE", None, &event).unwrap();
    assert!(row_id > 0);

    let recent = connector.get_recent_events("G-SQLITE", 10).unwrap();
    assert_eq!(recent.len(), 1);
    assert_eq!(recent[0].event_name, "sqlite_event");

    let entity = GtmEntity {
        id: "tag_1".into(),
        workspace_id: "ws_1".into(),
        entity_type: "tag".into(),
        name: "GA4 Pageview".into(),
        data_json: "{}".into(),
        fingerprint: "fp1".into(),
    };
    connector.upsert_entity(&entity).unwrap();
    let entities = connector.get_entities("ws_1", Some("tag")).unwrap();
    assert_eq!(entities.len(), 1);
    assert!(connector.delete_entity("tag_1").unwrap());

    let ver = GtmVersion {
        id: "v1".into(),
        container_id: "c1".into(),
        name: "V1".into(),
        description: None,
        entities_json: "[]".into(),
        created_at: 1000,
    };
    connector.save_version(&ver).unwrap();
    assert_eq!(connector.get_versions("c1").unwrap().len(), 1);

    let anno = Annotation {
        id: "a1".into(),
        property_id: "G-SQLITE".into(),
        title: "Campaign launched".into(),
        description: "Black friday promo campaign".into(),
        date: "2026-11-18".into(),
        color: "#1a73e8".into(),
        created_at: 1000,
    };
    connector.save_annotation(&anno).unwrap();
    assert_eq!(connector.get_annotations("G-SQLITE").unwrap().len(), 1);
    assert!(connector.delete_annotation("a1").unwrap());
}

#[test]
fn test_postgres_connector_lifecycle() {
    let connector = ConnectorFactory::create_connector("postgres://localhost:5432/test").unwrap();
    assert_eq!(connector.engine_type(), DatabaseEngine::Postgres);
    assert!(connector.ping().is_ok());

    let mut event = CanonicalEvent::default();
    event.event_name = "postgres_hit".into();
    connector.insert_event("G-PG", None, &event).unwrap();
    let events = connector.get_recent_events("G-PG", 5).unwrap();
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].event_name, "postgres_hit");
}

#[test]
fn test_mysql_connector_lifecycle() {
    let connector = ConnectorFactory::create_connector("mysql://localhost:3306/test").unwrap();
    assert_eq!(connector.engine_type(), DatabaseEngine::MySql);
    assert!(connector.ping().is_ok());

    let mut event = CanonicalEvent::default();
    event.event_name = "mysql_hit".into();
    connector.insert_event("G-MYSQL", None, &event).unwrap();
    let events = connector.get_recent_events("G-MYSQL", 5).unwrap();
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].event_name, "mysql_hit");
}

#[test]
fn test_mongo_connector_lifecycle() {
    let connector = ConnectorFactory::create_connector("mongodb://localhost:27017/test").unwrap();
    assert_eq!(connector.engine_type(), DatabaseEngine::Mongo);
    assert!(connector.ping().is_ok());

    let mut event = CanonicalEvent::default();
    event.event_name = "mongo_purchase".into();
    connector.insert_event("G-MONGO", None, &event).unwrap();
    let events = connector.get_recent_events("G-MONGO", 5).unwrap();
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].event_name, "mongo_purchase");

    let entity = GtmEntity {
        id: "trig_1".into(),
        workspace_id: "ws_mg".into(),
        entity_type: "trigger".into(),
        name: "Click Trigger".into(),
        data_json: "{}".into(),
        fingerprint: "fpmg".into(),
    };
    connector.upsert_entity(&entity).unwrap();
    assert_eq!(connector.get_entities("ws_mg", None).unwrap().len(), 1);
    assert!(connector.delete_entity("trig_1").unwrap());
}
