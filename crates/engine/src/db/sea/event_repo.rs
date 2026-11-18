use crate::wire::model::CanonicalEvent;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
    QueryOrder, QuerySelect, Set,
};
use super::raw_events;

pub struct SeaEventRepo;

impl SeaEventRepo {
    pub async fn insert_event(
        db: &DatabaseConnection,
        property_id: &str,
        stream_id: Option<&str>,
        event: &CanonicalEvent,
    ) -> Result<i64, DbErr> {
        let params_json = serde_json::to_string(&event.event_params).unwrap_or_else(|_| "{}".to_string());
        let user_props_json = serde_json::to_string(&event.user_properties).ok();

        let active = raw_events::ActiveModel {
            id: sea_orm::ActiveValue::NotSet,
            property_id: Set(property_id.to_string()),
            stream_id: Set(stream_id.map(|s| s.to_string())),
            client_id: Set(event.client_id.clone()),
            user_id: Set(event.user_id.clone()),
            session_id: Set(event.session_id),
            session_number: Set(event.session_number),
            event_name: Set(event.event_name.clone()),
            timestamp_micros: Set(event.timestamp_micros),
            event_params_json: Set(params_json),
            user_properties_json: Set(user_props_json),
            consent_state: Set(event.consent_state.clone()),
            consent_detail: Set(event.consent_detail.clone()),
            is_conversion: Set(if event.is_conversion { 1 } else { 0 }),
            is_modeled: Set(0),
        };

        let res = active.insert(db).await?;
        Ok(res.id)
    }

    pub async fn get_recent_events(
        db: &DatabaseConnection,
        property_id: &str,
        limit: u64,
    ) -> Result<Vec<CanonicalEvent>, DbErr> {
        let records = raw_events::Entity::find()
            .filter(raw_events::Column::PropertyId.eq(property_id))
            .order_by_desc(raw_events::Column::TimestampMicros)
            .limit(limit)
            .all(db)
            .await?;

        let list = records
            .into_iter()
            .map(|r| {
                let params = serde_json::from_str(&r.event_params_json).unwrap_or_default();
                let user_props = r
                    .user_properties_json
                    .and_then(|u| serde_json::from_str(&u).ok())
                    .unwrap_or_default();

                CanonicalEvent {
                    event_name: r.event_name,
                    client_id: r.client_id,
                    user_id: r.user_id,
                    session_id: r.session_id,
                    session_number: r.session_number,
                    timestamp_micros: r.timestamp_micros,
                    event_params: params,
                    user_properties: user_props,
                    consent_state: r.consent_state,
                    consent_detail: r.consent_detail,
                    is_conversion: r.is_conversion == 1,
                    ..Default::default()
                }
            })
            .collect();

        Ok(list)
    }
}
