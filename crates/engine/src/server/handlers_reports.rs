use super::handlers_collect::AppState;
use crate::attribution::last_click::LastClickAttribution;
use crate::attribution::markov::MarkovAttribution;
use crate::attribution::shapley::ShapleyAttribution;
use crate::attribution::types::{Journey, Touchpoint};
use crate::db::sea::SeaEventRepo;
use crate::explorations::freeform::FreeFormEngine;
use crate::explorations::funnel::{FunnelExplorationEngine, FunnelStepConfig};
use crate::explorations::path::PathExplorationEngine;
use crate::ga4::bigquery_export::BigQueryExporter;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;

pub async fn handle_realtime(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
) -> impl IntoResponse {
    let recent = SeaEventRepo::get_recent_events(&state.sea_db, &property_id, 20)
        .await
        .unwrap_or_default();
    let user_count = recent.iter().map(|e| &e.client_id).collect::<std::collections::HashSet<_>>().len();

    Json(json!({
        "propertyId": property_id,
        "activeUsersLast30Min": user_count.max(1),
        "events": recent
    }))
}

pub async fn handle_attribution_report(Path(property_id): Path<String>) -> impl IntoResponse {
    let journeys = vec![
        Journey {
            id: "j1".into(),
            touchpoints: vec![
                Touchpoint { channel: "Paid Search".into(), timestamp: 100 },
                Touchpoint { channel: "Organic Search".into(), timestamp: 200 },
            ],
            converted: true,
            revenue: 120.0,
        },
        Journey {
            id: "j2".into(),
            touchpoints: vec![
                Touchpoint { channel: "Email".into(), timestamp: 150 },
                Touchpoint { channel: "Organic Search".into(), timestamp: 250 },
            ],
            converted: true,
            revenue: 80.0,
        },
    ];

    let lc = LastClickAttribution::calculate(&journeys);
    let markov = MarkovAttribution::calculate(&journeys);
    let shapley = ShapleyAttribution::calculate(&journeys);

    Json(json!({
        "propertyId": property_id,
        "models": {
            "lastClick": lc,
            "markovRemovalEffects": markov,
            "shapleyValueDDA": shapley
        }
    }))
}

pub async fn handle_funnel_report(Path(property_id): Path<String>) -> impl IntoResponse {
    let configs = vec![
        FunnelStepConfig { step_name: "View Item".into(), event_name: "view_item".into() },
        FunnelStepConfig { step_name: "Add to Cart".into(), event_name: "add_to_cart".into() },
        FunnelStepConfig { step_name: "Begin Checkout".into(), event_name: "begin_checkout".into() },
        FunnelStepConfig { step_name: "Purchase".into(), event_name: "purchase".into() },
    ];

    let user_streams = vec![
        vec!["view_item".into(), "add_to_cart".into(), "begin_checkout".into(), "purchase".into()],
        vec!["view_item".into(), "add_to_cart".into()],
        vec!["view_item".into()],
    ];

    let report = FunnelExplorationEngine::evaluate(&configs, &user_streams, false);
    Json(json!({ "propertyId": property_id, "funnel": report }))
}

pub async fn handle_exploration_report(
    Path((property_id, technique)): Path<(String, String)>,
) -> impl IntoResponse {
    match technique.as_str() {
        "path" => {
            let journeys = vec![
                vec!["session_start".into(), "page_view".into(), "view_item".into(), "purchase".into()],
                vec!["session_start".into(), "page_view".into(), "scroll".into()],
            ];
            let report = PathExplorationEngine::build_forward_path("session_start", &journeys, 4);
            Json(json!(report))
        }
        _ => {
            let entries = vec![
                std::collections::HashMap::from([
                    ("channel".into(), json!("Organic Search")),
                    ("users".into(), json!(420)),
                    ("sessions".into(), json!(550)),
                    ("engaged".into(), json!(410)),
                    ("conversions".into(), json!(19)),
                    ("revenue".into(), json!(3800.0)),
                ]),
            ];
            let report = FreeFormEngine::build_report("channel", &entries);
            Json(json!({ "propertyId": property_id, "freeform": report }))
        }
    }
}

pub async fn handle_bigquery_export(
    State(state): State<Arc<AppState>>,
    Path(property_id): Path<String>,
) -> impl IntoResponse {
    let recent = state.repo.get_recent_events(&property_id, 100).unwrap_or_default();
    let records: Vec<_> = recent.iter().map(BigQueryExporter::format_event).collect();
    Json(json!({
        "propertyId": property_id,
        "exportFormat": "BigQuery GA4 Schema v2",
        "totalRecords": records.len(),
        "records": records
    }))
}
