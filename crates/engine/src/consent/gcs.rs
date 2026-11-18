use super::types::{ConsentSettings, ConsentStatus};

pub struct GcsCodec;

impl GcsCodec {
    /// Encodes ConsentSettings into GCS string format e.g. "G111", "G100", "G101", "G110"
    pub fn encode(settings: &ConsentSettings) -> String {
        let ad = if settings.ad_storage == ConsentStatus::Granted { '1' } else { '0' };
        let ana = if settings.analytics_storage == ConsentStatus::Granted { '1' } else { '0' };
        format!("G1{}{}", ad, ana)
    }

    /// Decodes GCS string into partial ConsentSettings
    pub fn decode(gcs: &str) -> Option<ConsentSettings> {
        if !gcs.starts_with("G1") || gcs.len() < 4 {
            return None;
        }
        let chars: Vec<char> = gcs.chars().collect();
        let ad = if chars[2] == '1' { ConsentStatus::Granted } else { ConsentStatus::Denied };
        let ana = if chars[3] == '1' { ConsentStatus::Granted } else { ConsentStatus::Denied };

        Some(ConsentSettings {
            ad_storage: ad,
            analytics_storage: ana,
            ad_user_data: ad,
            ad_personalization: ad,
        })
    }
}
