use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
    QueryOrder, Set,
};
use super::{container_entities, container_versions, workspaces};

pub struct SeaEntityRepo;

impl SeaEntityRepo {
    pub async fn get_entities(
        db: &DatabaseConnection,
        workspace_id: &str,
        entity_type: Option<&str>,
    ) -> Result<Vec<container_entities::Model>, DbErr> {
        let mut query = container_entities::Entity::find()
            .filter(container_entities::Column::WorkspaceId.eq(workspace_id));
        if let Some(et) = entity_type {
            query = query.filter(container_entities::Column::EntityType.eq(et));
        }
        query.all(db).await
    }

    pub async fn create_entity(
        db: &DatabaseConnection,
        entity: container_entities::Model,
    ) -> Result<container_entities::Model, DbErr> {
        let active = container_entities::ActiveModel {
            id: Set(entity.id),
            workspace_id: Set(entity.workspace_id),
            entity_type: Set(entity.entity_type),
            name: Set(entity.name),
            data_json: Set(entity.data_json),
            fingerprint: Set(entity.fingerprint),
        };
        active.insert(db).await
    }

    pub async fn update_entity(
        db: &DatabaseConnection,
        id: &str,
        name: Option<String>,
        data_json: Option<String>,
    ) -> Result<Option<container_entities::Model>, DbErr> {
        let existing = container_entities::Entity::find_by_id(id).one(db).await?;
        if let Some(model) = existing {
            let mut active: container_entities::ActiveModel = model.into();
            if let Some(n) = name {
                active.name = Set(n);
            }
            if let Some(d) = data_json {
                active.data_json = Set(d);
            }
            active.fingerprint = Set(uuid_like_fingerprint());
            let updated = active.update(db).await?;
            Ok(Some(updated))
        } else {
            Ok(None)
        }
    }

    pub async fn delete_entity(db: &DatabaseConnection, id: &str) -> Result<bool, DbErr> {
        let res = container_entities::Entity::delete_by_id(id).exec(db).await?;
        Ok(res.rows_affected > 0)
    }

    pub async fn list_versions(
        db: &DatabaseConnection,
        container_id: &str,
    ) -> Result<Vec<container_versions::Model>, DbErr> {
        container_versions::Entity::find()
            .filter(container_versions::Column::ContainerId.eq(container_id))
            .order_by_desc(container_versions::Column::CreatedAt)
            .all(db)
            .await
    }

    pub async fn publish_workspace(
        db: &DatabaseConnection,
        workspace_id: &str,
        version_name: &str,
        description: Option<String>,
    ) -> Result<container_versions::Model, DbErr> {
        let ws = workspaces::Entity::find_by_id(workspace_id)
            .one(db)
            .await?
            .ok_or_else(|| DbErr::Custom("Workspace not found".to_string()))?;

        let entities = container_entities::Entity::find()
            .filter(container_entities::Column::WorkspaceId.eq(workspace_id))
            .all(db)
            .await?;

        let entities_json = serde_json::to_string(&entities)
            .map_err(|e| DbErr::Custom(e.to_string()))?;

        let now = chrono::Utc::now().timestamp_millis();
        let version_id = format!("ver_{}", now);
        let active = container_versions::ActiveModel {
            id: Set(version_id),
            container_id: Set(ws.container_id),
            name: Set(version_name.to_string()),
            description: Set(description),
            entities_json: Set(entities_json),
            created_at: Set(now),
        };
        active.insert(db).await
    }
}

fn uuid_like_fingerprint() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    format!("{:016x}", rng.gen::<u64>())
}
