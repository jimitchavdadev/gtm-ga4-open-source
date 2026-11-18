use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PipelineAction {
    Allowlist,
    Blocklist,
    HashSha256,
    Augment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineRule {
    pub id: String,
    pub priority: i32,
    pub action: PipelineAction,
    pub target_fields: Vec<String>,
    pub augment_data: Option<HashMap<String, serde_json::Value>>,
}
