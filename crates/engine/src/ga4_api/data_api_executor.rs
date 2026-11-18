use super::data_api_models::*;
use crate::wire::model::CanonicalEvent;
use std::collections::{HashMap, HashSet};

pub struct DataApiExecutor;

impl DataApiExecutor {
    pub fn execute_report(events: &[CanonicalEvent], req: &RunReportRequest) -> RunReportResponse {
        let requested_dims: Vec<String> = req.dimensions.as_ref().map_or_else(
            || vec!["eventName".to_string()],
            |dims| dims.iter().map(|d| d.name.clone()).collect(),
        );

        let requested_metrics: Vec<String> = req.metrics.as_ref().map_or_else(
            || vec!["eventCount".to_string(), "activeUsers".to_string()],
            |mets| mets.iter().map(|m| m.name.clone()).collect(),
        );

        // Group events by dimension values
        let mut groups: HashMap<Vec<String>, Vec<&CanonicalEvent>> = HashMap::new();
        for ev in events {
            let dim_vals: Vec<String> = requested_dims
                .iter()
                .map(|dim| Self::extract_dimension(ev, dim))
                .collect();
            groups.entry(dim_vals).or_default().push(ev);
        }

        let mut rows: Vec<Row> = Vec::new();
        for (dim_vals, group_events) in groups {
            let metric_vals: Vec<MetricValue> = requested_metrics
                .iter()
                .map(|m| MetricValue {
                    value: Self::calculate_metric(&group_events, m),
                })
                .collect();

            let dimension_values = dim_vals
                .into_iter()
                .map(|v| DimensionValue { value: v })
                .collect();

            rows.push(Row {
                dimension_values,
                metric_values: metric_vals,
            });
        }

        // Default sort by first metric descending if numeric
        rows.sort_by(|a, b| {
            let val_a: f64 = a.metric_values.first().and_then(|v| v.value.parse().ok()).unwrap_or(0.0);
            let val_b: f64 = b.metric_values.first().and_then(|v| v.value.parse().ok()).unwrap_or(0.0);
            val_b.partial_cmp(&val_a).unwrap_or(std::cmp::Ordering::Equal)
        });

        let offset = req.offset.unwrap_or(0);
        let limit = req.limit.unwrap_or(10000);
        let total_count = rows.len();
        let paginated_rows: Vec<Row> = rows.into_iter().skip(offset).take(limit).collect();

        RunReportResponse {
            dimension_headers: requested_dims.into_iter().map(|name| DimensionHeader { name }).collect(),
            metric_headers: requested_metrics
                .into_iter()
                .map(|name| MetricHeader {
                    metric_type: if name.contains("Revenue") || name.contains("Value") {
                        "TYPE_CURRENCY".into()
                    } else {
                        "TYPE_INTEGER".into()
                    },
                    name,
                })
                .collect(),
            rows: paginated_rows,
            row_count: total_count,
            metadata: ResponseMetadata {
                currency_code: Some("USD".into()),
                time_zone: Some("UTC".into()),
            },
        }
    }

    fn extract_dimension(ev: &CanonicalEvent, dim_name: &str) -> String {
        match dim_name {
            "eventName" => ev.event_name.clone(),
            "clientId" => ev.client_id.clone(),
            "userId" => ev.user_id.clone().unwrap_or_else(|| "(not set)".into()),
            "sessionSource" | "source" => ev
                .event_params
                .get("cs")
                .or_else(|| ev.event_params.get("source"))
                .and_then(|v| v.as_str())
                .unwrap_or("(direct)")
                .to_string(),
            "sessionMedium" | "medium" => ev
                .event_params
                .get("cm")
                .or_else(|| ev.event_params.get("medium"))
                .and_then(|v| v.as_str())
                .unwrap_or("(none)")
                .to_string(),
            "country" => ev
                .event_params
                .get("country")
                .and_then(|v| v.as_str())
                .unwrap_or("(not set)")
                .to_string(),
            "deviceCategory" => ev
                .event_params
                .get("device_category")
                .and_then(|v| v.as_str())
                .unwrap_or("desktop")
                .to_string(),
            custom => ev
                .event_params
                .get(custom)
                .or_else(|| ev.user_properties.get(custom))
                .map(|v| match v {
                    serde_json::Value::String(s) => s.clone(),
                    other => other.to_string(),
                })
                .unwrap_or_else(|| "(not set)".into()),
        }
    }

    fn calculate_metric(group: &[&CanonicalEvent], metric_name: &str) -> String {
        match metric_name {
            "eventCount" => group.len().to_string(),
            "activeUsers" => {
                let distinct_cids: HashSet<&str> = group.iter().map(|e| e.client_id.as_str()).collect();
                distinct_cids.len().to_string()
            }
            "conversions" | "keyEvents" => {
                let count = group.iter().filter(|e| e.is_conversion).count();
                count.to_string()
            }
            "totalRevenue" | "purchaseRevenue" => {
                let sum: f64 = group
                    .iter()
                    .filter_map(|e| {
                        e.event_params
                            .get("value")
                            .or_else(|| e.event_params.get("epn.value"))
                            .and_then(|v| v.as_f64().or_else(|| v.as_str().and_then(|s| s.parse().ok())))
                    })
                    .sum();
                format!("{:.2}", sum)
            }
            custom => {
                let sum: f64 = group
                    .iter()
                    .filter_map(|e| {
                        e.event_params.get(custom).and_then(|v| {
                            v.as_f64().or_else(|| v.as_str().and_then(|s| s.parse().ok()))
                        })
                    })
                    .sum();
                sum.to_string()
            }
        }
    }
}
