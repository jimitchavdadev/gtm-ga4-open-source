use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserLifetimeRow {
    pub acquisition_channel: String,
    pub acquired_users: u64,
    pub lifetime_revenue: f64,
    pub lifetime_purchases: u64,
    pub lifetime_average_revenue_per_user: f64,
    pub lifetime_engagement_duration_mins: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserLifetimeReport {
    pub rows: Vec<UserLifetimeRow>,
    pub overall_ltv: f64,
    pub total_lifetime_revenue: f64,
}

pub struct UserLifetimeEngine;

impl UserLifetimeEngine {
    pub fn build_report(raw_data: &[(&str, u64, f64, u64, f64)]) -> UserLifetimeReport {
        let mut rows = Vec::new();
        let mut total_rev = 0.0;
        let mut total_users = 0;

        for (ch, users, rev, purch, eng_mins) in raw_data {
            total_rev += rev;
            total_users += users;
            let arpu = if *users > 0 { ((rev / *users as f64) * 100.0).round() / 100.0 } else { 0.0 };

            rows.push(UserLifetimeRow {
                acquisition_channel: ch.to_string(),
                acquired_users: *users,
                lifetime_revenue: *rev,
                lifetime_purchases: *purch,
                lifetime_average_revenue_per_user: arpu,
                lifetime_engagement_duration_mins: *eng_mins,
            });
        }

        let overall_ltv = if total_users > 0 {
            ((total_rev / total_users as f64) * 100.0).round() / 100.0
        } else {
            0.0
        };

        UserLifetimeReport {
            rows,
            overall_ltv,
            total_lifetime_revenue: (total_rev * 100.0).round() / 100.0,
        }
    }
}
