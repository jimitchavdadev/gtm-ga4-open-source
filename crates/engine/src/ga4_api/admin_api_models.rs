use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebStreamData {
    pub measurement_id: String,
    pub default_uri: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStreamData {
    pub app_id: String,
    pub firebase_app_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataStream {
    pub name: String,
    #[serde(rename = "type")]
    pub stream_type: String, // WEB_DATA_STREAM, IOS_APP_DATA_STREAM, ANDROID_APP_DATA_STREAM
    pub display_name: String,
    pub web_stream_data: Option<WebStreamData>,
    pub app_stream_data: Option<AppStreamData>,
    pub create_time: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomDimension {
    pub name: String,
    pub parameter_name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub scope: String, // EVENT, USER, ITEM
    pub disallow_ads_personalization: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomMetric {
    pub name: String,
    pub parameter_name: String,
    pub display_name: String,
    pub measurement_unit: String, // STANDARD, CURRENCY, MILLISECONDS, SECONDS
    pub scope: String, // EVENT
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudienceExport {
    pub name: String,
    pub audience: String,
    pub state: String, // CREATING, ACTIVE, FAILED
    pub row_count: usize,
    pub create_time: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserDeletionRequest {
    pub name: String,
    pub user_id: Option<String>,
    pub client_id: Option<String>,
    pub request_time: i64,
    pub purged_events_count: usize,
}
