use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CohortMetrics {
    pub observed_users: u64,
    pub observed_sessions: u64,
    pub observed_engaged_sessions: u64,
    pub cookieless_pings: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModeledResult {
    pub observed_users: u64,
    pub observed_sessions: u64,
    pub modeled_users: u64,
    pub modeled_sessions: u64,
    pub blended_users: u64,
    pub blended_sessions: u64,
    pub observed_engagement_rate: f64,
    pub blended_engagement_rate: f64,
    pub model_confidence_score: f64,
}

pub struct BehavioralModelEngine;

impl BehavioralModelEngine {
    /// Estimates unconsented users and sessions using consenting cohort baseline ratios
    pub fn compute_blended_metrics(cohort: &CohortMetrics) -> ModeledResult {
        let obs_users = cohort.observed_users.max(1);
        let obs_sessions = cohort.observed_sessions.max(1);

        // Average pings per session observed
        let sessions_per_user = (obs_sessions as f64) / (obs_users as f64);
        let engagement_rate = (cohort.observed_engaged_sessions as f64) / (obs_sessions as f64);

        // Standard GA4 heuristic: cookieless pings represent individual pageviews
        // Pings to session ratio ~ 2.4 pageviews per session
        let pings_per_session = 2.4f64;
        let modeled_sessions_raw = (cohort.cookieless_pings as f64) / pings_per_session;
        let modeled_sessions = modeled_sessions_raw.round() as u64;
        let modeled_users = ((modeled_sessions as f64) / sessions_per_user.max(1.0)).round() as u64;

        let blended_users = cohort.observed_users + modeled_users;
        let blended_sessions = cohort.observed_sessions + modeled_sessions;

        // Model confidence based on sample size of observed cohort (min 500 hits for high confidence)
        let confidence = (obs_sessions as f64 / 500.0).clamp(0.40, 0.98);

        let blended_eng_rate = if blended_sessions > 0 {
            let modeled_engaged = (modeled_sessions as f64) * engagement_rate;
            ((cohort.observed_engaged_sessions as f64) + modeled_engaged) / (blended_sessions as f64)
        } else {
            0.0
        };

        ModeledResult {
            observed_users: cohort.observed_users,
            observed_sessions: cohort.observed_sessions,
            modeled_users,
            modeled_sessions,
            blended_users,
            blended_sessions,
            observed_engagement_rate: (engagement_rate * 100.0).round() / 100.0,
            blended_engagement_rate: (blended_eng_rate * 100.0).round() / 100.0,
            model_confidence_score: (confidence * 100.0).round() / 100.0,
        }
    }
}
