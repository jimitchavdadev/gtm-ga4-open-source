use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Annotation {
    pub id: String,
    pub property_id: String,
    pub title: String,
    pub description: String,
    pub date: String, // YYYY-MM-DD
    pub color: String, // e.g. #1a73e8
    pub created_at: i64,
}

pub struct AnnotationsManager;

impl AnnotationsManager {
    pub fn validate_annotation(title: &str, description: &str, current_count: usize) -> Result<(), String> {
        if title.trim().is_empty() {
            return Err("Annotation title cannot be empty".to_string());
        }
        if title.len() > 60 {
            return Err("Annotation title exceeds 60 characters limit".to_string());
        }
        if description.len() > 150 {
            return Err("Annotation description exceeds 150 characters limit".to_string());
        }
        if current_count >= 1000 {
            return Err("Property has reached the maximum of 1,000 annotations".to_string());
        }
        Ok(())
    }
}
