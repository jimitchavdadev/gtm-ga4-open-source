use crate::ga4::Annotation;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
    QueryOrder, Set,
};
use super::annotations;

pub struct SeaAnnotationRepo;

impl SeaAnnotationRepo {
    pub async fn list_annotations(
        db: &DatabaseConnection,
        property_id: &str,
    ) -> Result<Vec<Annotation>, DbErr> {
        let rows = annotations::Entity::find()
            .filter(annotations::Column::PropertyId.eq(property_id))
            .order_by_desc(annotations::Column::CreatedAt)
            .all(db)
            .await?;

        let list = rows
            .into_iter()
            .map(|r| Annotation {
                id: r.id,
                property_id: r.property_id,
                title: r.title,
                description: r.description,
                date: r.date,
                color: r.color,
                created_at: r.created_at,
            })
            .collect();

        Ok(list)
    }

    pub async fn create_annotation(
        db: &DatabaseConnection,
        annotation: Annotation,
    ) -> Result<Annotation, DbErr> {
        let active = annotations::ActiveModel {
            id: Set(annotation.id.clone()),
            property_id: Set(annotation.property_id.clone()),
            title: Set(annotation.title.clone()),
            description: Set(annotation.description.clone()),
            date: Set(annotation.date.clone()),
            color: Set(annotation.color.clone()),
            created_at: Set(annotation.created_at),
        };

        active.insert(db).await?;
        Ok(annotation)
    }

    pub async fn delete_annotation(db: &DatabaseConnection, id: &str) -> Result<bool, DbErr> {
        let res = annotations::Entity::delete_by_id(id).exec(db).await?;
        Ok(res.rows_affected > 0)
    }
}
