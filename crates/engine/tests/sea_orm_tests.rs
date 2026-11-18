use analytics_engine::db::sea::{
    connect_sea_database, SeaAnnotationRepo, SeaEntityRepo, SeaEventRepo,
};
use analytics_engine::db::sea::container_entities;
use analytics_engine::ga4::Annotation;
use analytics_engine::wire::model::CanonicalEvent;

#[tokio::test]
async fn test_sea_orm_database_and_crud() {
    let db = connect_sea_database("sqlite::memory:")
        .await
        .expect("Failed to initialize SeaORM in-memory database");

    // Test Entity Repo
    let entities = SeaEntityRepo::get_entities(&db, "ws_default", None)
        .await
        .expect("Failed to get entities");
    assert_eq!(entities.len(), 0);

    let created = SeaEntityRepo::create_entity(
        &db,
        container_entities::Model {
            id: "ent_test_1".to_string(),
            workspace_id: "ws_default".to_string(),
            entity_type: "TAG".to_string(),
            name: "GA4 Configuration Tag".to_string(),
            data_json: r#"{"measurementId": "G-12345"}"#.to_string(),
            fingerprint: "fp_test".to_string(),
        },
    )
    .await
    .expect("Failed to create entity");
    assert_eq!(created.name, "GA4 Configuration Tag");

    let updated = SeaEntityRepo::update_entity(
        &db,
        "ent_test_1",
        Some("GA4 Tag Renamed".to_string()),
        None,
    )
    .await
    .expect("Failed to update entity")
    .expect("Entity not found");
    assert_eq!(updated.name, "GA4 Tag Renamed");

    // Test Event Repo
    let mut ev = CanonicalEvent::default();
    ev.event_name = "page_view".to_string();
    ev.client_id = "client_123".to_string();
    let row_id = SeaEventRepo::insert_event(&db, "prop_1", Some("stream_1"), &ev)
        .await
        .expect("Failed to insert event");
    assert!(row_id > 0);

    let recent = SeaEventRepo::get_recent_events(&db, "prop_1", 10)
        .await
        .expect("Failed to get recent events");
    assert_eq!(recent.len(), 1);
    assert_eq!(recent[0].event_name, "page_view");

    // Test Annotation Repo
    let ann = Annotation {
        id: "ann_1".to_string(),
        property_id: "prop_1".to_string(),
        title: "Product Launch".to_string(),
        description: "Launched version 2.0".to_string(),
        date: "2026-11-18".to_string(),
        color: "#1a73e8".to_string(),
        created_at: 1731900000,
    };
    let created_ann = SeaAnnotationRepo::create_annotation(&db, ann)
        .await
        .expect("Failed to create annotation");
    assert_eq!(created_ann.title, "Product Launch");

    let list = SeaAnnotationRepo::list_annotations(&db, "prop_1")
        .await
        .expect("Failed to list annotations");
    assert_eq!(list.len(), 1);
}
