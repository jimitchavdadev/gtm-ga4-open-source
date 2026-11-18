use crate::wire::model::CanonicalEvent;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigQueryParamValue {
    pub string_value: Option<String>,
    pub int_value: Option<i64>,
    pub float_value: Option<f64>,
    pub double_value: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigQueryEventParam {
    pub key: String,
    pub value: BigQueryParamValue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigQueryPrivacyInfo {
    pub analytics_storage: Option<String>,
    pub ads_storage: Option<String>,
    pub uses_transient_token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigQueryEventRecord {
    pub event_date: String,
    pub event_timestamp: i64,
    pub event_name: String,
    pub event_params: Vec<BigQueryEventParam>,
    pub user_id: Option<String>,
    pub user_pseudo_id: String,
    pub privacy_info: BigQueryPrivacyInfo,
}

pub struct BigQueryExporter;

impl BigQueryExporter {
    pub fn format_event(event: &CanonicalEvent) -> BigQueryEventRecord {
        let date_str = chrono::DateTime::from_timestamp_micros(event.timestamp_micros)
            .map(|dt| dt.format("%Y%m%d").to_string())
            .unwrap_or_else(|| "20261118".to_string());

        let mut bq_params = Vec::new();
        for (k, v) in &event.event_params {
            let val = match v {
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        BigQueryParamValue { string_value: None, int_value: Some(i), float_value: None, double_value: None }
                    } else {
                        BigQueryParamValue { string_value: None, int_value: None, float_value: None, double_value: n.as_f64() }
                    }
                }
                serde_json::Value::String(s) => BigQueryParamValue { string_value: Some(s.clone()), int_value: None, float_value: None, double_value: None },
                _ => BigQueryParamValue { string_value: Some(v.to_string()), int_value: None, float_value: None, double_value: None },
            };
            bq_params.push(BigQueryEventParam { key: k.clone(), value: val });
        }

        BigQueryEventRecord {
            event_date: date_str,
            event_timestamp: event.timestamp_micros,
            event_name: event.event_name.clone(),
            event_params: bq_params,
            user_id: event.user_id.clone(),
            user_pseudo_id: event.client_id.clone(),
            privacy_info: BigQueryPrivacyInfo {
                analytics_storage: event.consent_state.clone(),
                ads_storage: event.consent_detail.clone(),
                uses_transient_token: Some("No".into()),
            },
        }
    }
}
