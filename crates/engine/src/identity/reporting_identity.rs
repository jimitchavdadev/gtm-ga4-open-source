use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReportingIdentityMode {
    Blended,
    Observed,
    DeviceBased,
}

impl Default for ReportingIdentityMode {
    fn default() -> Self {
        Self::Blended
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityResolutionResult {
    pub resolved_id: String,
    pub identity_space: IdentitySpace,
    pub is_modeled: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IdentitySpace {
    UserId,
    DeviceId,
    ModeledEphemeral,
}

pub struct ReportingIdentityResolver;

impl ReportingIdentityResolver {
    pub fn resolve_identity(
        mode: ReportingIdentityMode,
        user_id: Option<&str>,
        client_id: &str,
        is_cookieless: bool,
    ) -> IdentityResolutionResult {
        match mode {
            ReportingIdentityMode::DeviceBased => IdentityResolutionResult {
                resolved_id: client_id.to_string(),
                identity_space: IdentitySpace::DeviceId,
                is_modeled: false,
            },
            ReportingIdentityMode::Observed => {
                if let Some(uid) = user_id {
                    IdentityResolutionResult {
                        resolved_id: uid.to_string(),
                        identity_space: IdentitySpace::UserId,
                        is_modeled: false,
                    }
                } else {
                    IdentityResolutionResult {
                        resolved_id: client_id.to_string(),
                        identity_space: IdentitySpace::DeviceId,
                        is_modeled: false,
                    }
                }
            }
            ReportingIdentityMode::Blended => {
                if let Some(uid) = user_id {
                    IdentityResolutionResult {
                        resolved_id: uid.to_string(),
                        identity_space: IdentitySpace::UserId,
                        is_modeled: false,
                    }
                } else if is_cookieless {
                    // Cookieless hit under Blended mode triggers behavioral modeling attribution
                    IdentityResolutionResult {
                        resolved_id: client_id.to_string(),
                        identity_space: IdentitySpace::ModeledEphemeral,
                        is_modeled: true,
                    }
                } else {
                    IdentityResolutionResult {
                        resolved_id: client_id.to_string(),
                        identity_space: IdentitySpace::DeviceId,
                        is_modeled: false,
                    }
                }
            }
        }
    }
}
