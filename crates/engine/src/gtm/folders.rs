use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GtmFolder {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    #[serde(default)]
    pub entity_ids: Vec<String>,
}

impl GtmFolder {
    pub fn new(id: &str, workspace_id: &str, name: &str) -> Self {
        Self {
            id: id.to_string(),
            workspace_id: workspace_id.to_string(),
            name: name.to_string(),
            entity_ids: Vec::new(),
        }
    }

    pub fn add_entity(&mut self, entity_id: &str) {
        if !self.entity_ids.iter().any(|id| id == entity_id) {
            self.entity_ids.push(entity_id.to_string());
        }
    }

    pub fn remove_entity(&mut self, entity_id: &str) {
        self.entity_ids.retain(|id| id != entity_id);
    }
}
