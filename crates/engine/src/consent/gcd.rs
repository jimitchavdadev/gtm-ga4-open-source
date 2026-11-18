use super::types::{ConsentSettings, ConsentStatus};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GcdSource {
    DefaultDenied,
    DefaultGranted,
    UpdatedDenied,
    UpdatedGranted,
    NotSet,
}

impl GcdSource {
    pub fn to_code(self) -> char {
        match self {
            Self::DefaultDenied => 'p',
            Self::DefaultGranted => 't',
            Self::UpdatedDenied => 'r',
            Self::UpdatedGranted => 'v',
            Self::NotSet => 'l',
        }
    }

    pub fn from_code(c: char) -> Self {
        match c {
            'p' | 'q' => Self::DefaultDenied,
            't' | 'u' => Self::DefaultGranted,
            'r' => Self::UpdatedDenied,
            'v' => Self::UpdatedGranted,
            _ => Self::NotSet,
        }
    }

    pub fn to_status(self) -> ConsentStatus {
        match self {
            Self::DefaultGranted | Self::UpdatedGranted => ConsentStatus::Granted,
            Self::DefaultDenied | Self::UpdatedDenied => ConsentStatus::Denied,
            Self::NotSet => ConsentStatus::Unset,
        }
    }
}

pub struct GcdCodec;

impl GcdCodec {
    /// Encodes sources for [ad_storage, analytics_storage, ad_user_data, ad_personalization] into GCD string
    /// Example format: "1pqpq5" or "1tvtv5"
    pub fn encode(sources: [GcdSource; 4]) -> String {
        format!(
            "1{}{}{}{}5",
            sources[0].to_code(),
            sources[1].to_code(),
            sources[2].to_code(),
            sources[3].to_code()
        )
    }

    /// Decodes GCD string into ConsentSettings
    pub fn decode(gcd: &str) -> Option<ConsentSettings> {
        let chars: Vec<char> = gcd.chars().collect();
        if chars.len() < 6 || chars[0] != '1' {
            return None;
        }

        let ad = GcdSource::from_code(chars[1]).to_status();
        let ana = GcdSource::from_code(chars[2]).to_status();
        let aud = GcdSource::from_code(chars[3]).to_status();
        let ap = GcdSource::from_code(chars[4]).to_status();

        Some(ConsentSettings {
            ad_storage: ad,
            analytics_storage: ana,
            ad_user_data: aud,
            ad_personalization: ap,
        })
    }
}
