use crate::consent::gcd::{GcdCodec, GcdSource};
use crate::consent::gcs::GcsCodec;
use crate::consent::types::{ConsentSettings, ConsentStatus};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConsentType {
    AdStorage,
    AnalyticsStorage,
    AdUserData,
    AdPersonalization,
}

pub struct GtmConsentManager {
    settings: ConsentSettings,
}

impl Default for GtmConsentManager {
    fn default() -> Self {
        Self::new()
    }
}

impl GtmConsentManager {
    pub fn new() -> Self {
        Self {
            settings: ConsentSettings::default(),
        }
    }

    pub fn with_settings(settings: ConsentSettings) -> Self {
        Self { settings }
    }

    pub fn update_consent(&mut self, consent_type: ConsentType, status: ConsentStatus) {
        match consent_type {
            ConsentType::AdStorage => self.settings.ad_storage = status,
            ConsentType::AnalyticsStorage => self.settings.analytics_storage = status,
            ConsentType::AdUserData => self.settings.ad_user_data = status,
            ConsentType::AdPersonalization => self.settings.ad_personalization = status,
        }
    }

    pub fn can_tag_fire(&self, required_types: &[String]) -> bool {
        for req in required_types {
            let matches_granted = match req.as_str() {
                "ad_storage" => self.settings.ad_storage == ConsentStatus::Granted,
                "analytics_storage" => self.settings.analytics_storage == ConsentStatus::Granted,
                "ad_user_data" => self.settings.ad_user_data == ConsentStatus::Granted,
                "ad_personalization" => self.settings.ad_personalization == ConsentStatus::Granted,
                _ => true,
            };
            if !matches_granted {
                return false;
            }
        }
        true
    }

    pub fn get_gcs(&self) -> String {
        GcsCodec::encode(&self.settings)
    }

    pub fn get_gcd(&self) -> String {
        let to_source = |s: ConsentStatus| match s {
            ConsentStatus::Granted => GcdSource::UpdatedGranted,
            ConsentStatus::Denied => GcdSource::UpdatedDenied,
            ConsentStatus::Unset => GcdSource::NotSet,
        };
        GcdCodec::encode([
            to_source(self.settings.ad_storage),
            to_source(self.settings.analytics_storage),
            to_source(self.settings.ad_user_data),
            to_source(self.settings.ad_personalization),
        ])
    }

    pub fn get_settings(&self) -> &ConsentSettings {
        &self.settings
    }
}
