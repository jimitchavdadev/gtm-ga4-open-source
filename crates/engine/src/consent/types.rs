use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConsentStatus {
    Granted,
    Denied,
    Unset,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentSettings {
    pub ad_storage: ConsentStatus,
    pub analytics_storage: ConsentStatus,
    pub ad_user_data: ConsentStatus,
    pub ad_personalization: ConsentStatus,
}

impl Default for ConsentSettings {
    fn default() -> Self {
        Self {
            ad_storage: ConsentStatus::Denied,
            analytics_storage: ConsentStatus::Denied,
            ad_user_data: ConsentStatus::Denied,
            ad_personalization: ConsentStatus::Denied,
        }
    }
}

impl ConsentSettings {
    pub fn all_granted() -> Self {
        Self {
            ad_storage: ConsentStatus::Granted,
            analytics_storage: ConsentStatus::Granted,
            ad_user_data: ConsentStatus::Granted,
            ad_personalization: ConsentStatus::Granted,
        }
    }

    pub fn is_analytics_granted(&self) -> bool {
        self.analytics_storage == ConsentStatus::Granted
    }

    pub fn is_ad_granted(&self) -> bool {
        self.ad_storage == ConsentStatus::Granted
    }
}
