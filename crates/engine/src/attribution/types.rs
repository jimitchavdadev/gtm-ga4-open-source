use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Touchpoint {
    pub channel: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Journey {
    pub id: String,
    pub touchpoints: Vec<Touchpoint>,
    pub converted: bool,
    pub revenue: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionResult {
    pub weights: HashMap<String, f64>,
    pub allocated_revenue: HashMap<String, f64>,
}
