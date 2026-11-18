use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FreeFormRow {
    pub dimension_value: String,
    pub active_users: u64,
    pub sessions: u64,
    pub engaged_sessions: u64,
    pub engagement_rate: f64,
    pub conversions: u64,
    pub event_count: u64,
    pub total_revenue: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FreeFormReport {
    pub dimension_name: String,
    pub rows: Vec<FreeFormRow>,
    pub total_users: u64,
    pub total_sessions: u64,
    pub total_revenue: f64,
}

pub struct FreeFormEngine;

impl FreeFormEngine {
    pub fn build_report(dimension_name: &str, raw_entries: &[HashMap<String, serde_json::Value>]) -> FreeFormReport {
        let mut grouped: HashMap<String, FreeFormRow> = HashMap::new();
        let mut grand_users = 0;
        let mut grand_sessions = 0;
        let mut grand_revenue = 0.0;

        for entry in raw_entries {
            let dim_val = entry
                .get(dimension_name)
                .and_then(|v| v.as_str())
                .unwrap_or("(not set)")
                .to_string();

            let users = entry.get("users").and_then(|v| v.as_u64()).unwrap_or(1);
            let sessions = entry.get("sessions").and_then(|v| v.as_u64()).unwrap_or(1);
            let engaged = entry.get("engaged").and_then(|v| v.as_u64()).unwrap_or(1);
            let conv = entry.get("conversions").and_then(|v| v.as_u64()).unwrap_or(0);
            let events = entry.get("event_count").and_then(|v| v.as_u64()).unwrap_or(sessions * 3);
            let rev = entry.get("revenue").and_then(|v| v.as_f64()).unwrap_or(0.0);

            grand_users += users;
            grand_sessions += sessions;
            grand_revenue += rev;

            let row = grouped.entry(dim_val.clone()).or_insert_with(|| FreeFormRow {
                dimension_value: dim_val,
                active_users: 0,
                sessions: 0,
                engaged_sessions: 0,
                engagement_rate: 0.0,
                conversions: 0,
                event_count: 0,
                total_revenue: 0.0,
            });

            row.active_users += users;
            row.sessions += sessions;
            row.engaged_sessions += engaged;
            row.conversions += conv;
            row.event_count += events;
            row.total_revenue += rev;
        }

        let mut rows: Vec<FreeFormRow> = grouped.into_values().collect();
        for r in &mut rows {
            if r.sessions > 0 {
                r.engagement_rate = ((r.engaged_sessions as f64 / r.sessions as f64) * 100.0).round() / 100.0;
            }
        }
        rows.sort_by(|a, b| b.active_users.cmp(&a.active_users));

        FreeFormReport {
            dimension_name: dimension_name.to_string(),
            rows,
            total_users: grand_users,
            total_sessions: grand_sessions,
            total_revenue: (grand_revenue * 100.0).round() / 100.0,
        }
    }
}
