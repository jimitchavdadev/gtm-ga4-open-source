use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "raw_events")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    pub property_id: String,
    pub stream_id: Option<String>,
    pub client_id: String,
    pub user_id: Option<String>,
    pub session_id: Option<i64>,
    pub session_number: Option<i64>,
    pub event_name: String,
    pub timestamp_micros: i64,
    pub event_params_json: String,
    pub user_properties_json: Option<String>,
    pub consent_state: Option<String>,
    pub consent_detail: Option<String>,
    pub is_conversion: i32,
    pub is_modeled: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
