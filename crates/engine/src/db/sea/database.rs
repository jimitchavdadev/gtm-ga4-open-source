use sea_orm::{
    ActiveModelTrait, ConnectionTrait, Database, DatabaseConnection, DbBackend, DbErr, EntityTrait,
    Schema, Set,
};
use super::{
    accounts, annotations, container_entities, container_versions, containers, data_streams,
    properties, raw_events, workspaces,
};

pub async fn connect_sea_database(db_url: &str) -> Result<DatabaseConnection, DbErr> {
    let db = Database::connect(db_url).await?;
    init_sea_schema(&db).await?;
    seed_default_data(&db).await?;
    Ok(db)
}

pub async fn init_sea_schema(db: &DatabaseConnection) -> Result<(), DbErr> {
    let builder = db.get_database_backend();
    let schema = Schema::new(builder);

    create_table_if_needed(db, builder, &schema.create_table_from_entity(accounts::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(containers::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(workspaces::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(container_entities::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(container_versions::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(properties::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(data_streams::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(raw_events::Entity)).await?;
    create_table_if_needed(db, builder, &schema.create_table_from_entity(annotations::Entity)).await?;

    Ok(())
}

async fn create_table_if_needed(
    db: &DatabaseConnection,
    builder: DbBackend,
    table_create: &sea_orm::sea_query::TableCreateStatement,
) -> Result<(), DbErr> {
    let mut stmt = table_create.clone();
    stmt.if_not_exists();
    let query = builder.build(&stmt);
    let _ = db.execute(query).await;
    Ok(())
}

async fn seed_default_data(db: &DatabaseConnection) -> Result<(), DbErr> {
    let now = chrono::Utc::now().timestamp_millis();

    if accounts::Entity::find_by_id("acc_1").one(db).await?.is_none() {
        let acc = accounts::ActiveModel {
            id: Set("acc_1".to_string()),
            name: Set("Production GTM Account".to_string()),
            created_at: Set(now),
        };
        let _ = acc.insert(db).await;
    }

    if containers::Entity::find_by_id("GTM-OPENSOURCE").one(db).await?.is_none() {
        let cont = containers::ActiveModel {
            id: Set("GTM-OPENSOURCE".to_string()),
            account_id: Set("acc_1".to_string()),
            name: Set("Primary Web Container".to_string()),
            usage_context: Set("WEB".to_string()),
            created_at: Set(now),
        };
        let _ = cont.insert(db).await;
    }

    if workspaces::Entity::find_by_id("ws_default").one(db).await?.is_none() {
        let ws = workspaces::ActiveModel {
            id: Set("ws_default".to_string()),
            container_id: Set("GTM-OPENSOURCE".to_string()),
            name: Set("Default Workspace".to_string()),
            is_default: Set(1),
            created_at: Set(now),
        };
        let _ = ws.insert(db).await;
    }

    if properties::Entity::find_by_id("prop_1").one(db).await?.is_none() {
        let prop = properties::ActiveModel {
            id: Set("prop_1".to_string()),
            account_id: Set("acc_1".to_string()),
            display_name: Set("Primary Web Property".to_string()),
            reporting_identity_mode: Set("BLENDED".to_string()),
            is_360: Set(0),
            created_at: Set(now),
        };
        let _ = prop.insert(db).await;
    }

    if data_streams::Entity::find_by_id("stream_1").one(db).await?.is_none() {
        let stream = data_streams::ActiveModel {
            id: Set("stream_1".to_string()),
            property_id: Set("prop_1".to_string()),
            stream_type: Set("WEB".to_string()),
            measurement_id: Set("G-OPENSOURCE1".to_string()),
            api_secret: Set(Some("sec_opensource".to_string())),
            created_at: Set(now),
        };
        let _ = stream.insert(db).await;
    }

    Ok(())
}
