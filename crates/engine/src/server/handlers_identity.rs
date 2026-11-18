use crate::identity::reporting_identity::ReportingIdentityMode;
use crate::modeling::behavioral::{BehavioralModelEngine, CohortMetrics};
use crate::modeling::conversion::{ConversionModelEngine, ConversionModelInput};
use axum::{
    extract::{Path, Query},
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct IdentityQuery {
    pub mode: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct IdentityModeResponse {
    pub property_id: String,
    pub current_mode: String,
    pub available_modes: Vec<String>,
    pub behavioral_modeling_status: String,
    pub modeled_lift: f64,
}

pub async fn handle_get_identity_mode(
    Path(property_id): Path<String>,
    Query(query): Query<IdentityQuery>,
) -> impl IntoResponse {
    let mode = match query.mode.as_deref() {
        Some("OBSERVED") => ReportingIdentityMode::Observed,
        Some("DEVICE_BASED") => ReportingIdentityMode::DeviceBased,
        _ => ReportingIdentityMode::Blended,
    };

    let cohort = CohortMetrics {
        observed_users: 1420,
        observed_sessions: 2150,
        observed_engaged_sessions: 1680,
        cookieless_pings: 650,
    };

    let modeled = BehavioralModelEngine::compute_blended_metrics(&cohort);
    let conv_input = ConversionModelInput {
        observed_conversions: 85,
        observed_revenue: 8450.0,
        observed_conversion_rate: 0.039,
        modeled_sessions: modeled.modeled_sessions,
    };
    let conv_modeled = ConversionModelEngine::model_conversions(&conv_input);

    let mode_str = match mode {
        ReportingIdentityMode::Blended => "BLENDED",
        ReportingIdentityMode::Observed => "OBSERVED",
        ReportingIdentityMode::DeviceBased => "DEVICE_BASED",
    };

    Json(IdentityModeResponse {
        property_id,
        current_mode: mode_str.to_string(),
        available_modes: vec![
            "BLENDED".to_string(),
            "OBSERVED".to_string(),
            "DEVICE_BASED".to_string(),
        ],
        behavioral_modeling_status: "ACTIVE (Advanced Consent Mode v2)".to_string(),
        modeled_lift: conv_modeled.modeled_lift_pct,
    })
}
