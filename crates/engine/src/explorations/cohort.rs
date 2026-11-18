use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CohortRow {
    pub cohort_label: String, // e.g. "Week 1 (Nov 1 - Nov 7)"
    pub cohort_size: u64,
    pub retention_periods: Vec<f64>, // percentage retention for period 0, 1, 2, 3...
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CohortExplorationReport {
    pub granularity: String, // "DAILY" or "WEEKLY"
    pub cohorts: Vec<CohortRow>,
    pub average_retention: Vec<f64>,
}

pub struct CohortExplorationEngine;

impl CohortExplorationEngine {
    pub fn build_weekly_cohort_report(sample_cohorts: &[(&str, u64, &[f64])]) -> CohortExplorationReport {
        let mut rows = Vec::new();
        let max_periods = sample_cohorts.iter().map(|c| c.2.len()).max().unwrap_or(0);
        let mut sum_retention = vec![0.0; max_periods];
        let mut count_retention = vec![0.0; max_periods];

        for (label, size, rates) in sample_cohorts {
            rows.push(CohortRow {
                cohort_label: label.to_string(),
                cohort_size: *size,
                retention_periods: rates.to_vec(),
            });

            for (idx, r) in rates.iter().enumerate() {
                sum_retention[idx] += r;
                count_retention[idx] += 1.0;
            }
        }

        let avg_retention = sum_retention
            .into_iter()
            .zip(count_retention)
            .map(|(sum, cnt)| if cnt > 0.0 { ((sum / cnt) * 10.0).round() / 10.0 } else { 0.0 })
            .collect();

        CohortExplorationReport {
            granularity: "WEEKLY".to_string(),
            cohorts: rows,
            average_retention: avg_retention,
        }
    }
}
