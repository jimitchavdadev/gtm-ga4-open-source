use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerZone {
    pub id: String,
    pub name: String,
    pub parent_container_id: String,
    pub child_container_ids: Vec<String>,
    #[serde(default)]
    pub url_boundaries: Vec<String>,
    #[serde(default)]
    pub allowed_tag_types: Option<Vec<String>>,
    #[serde(default)]
    pub blocked_tag_types: Option<Vec<String>>,
}

impl ContainerZone {
    pub fn matches_boundary(&self, page_url: &str) -> bool {
        if self.url_boundaries.is_empty() {
            return true;
        }
        self.url_boundaries.iter().any(|b| page_url.contains(b))
    }

    pub fn is_tag_type_allowed(&self, tag_type: &str) -> bool {
        if let Some(ref blocked) = self.blocked_tag_types {
            if blocked.iter().any(|b| b == tag_type) {
                return false;
            }
        }
        if let Some(ref allowed) = self.allowed_tag_types {
            return allowed.iter().any(|a| a == tag_type);
        }
        true
    }
}
