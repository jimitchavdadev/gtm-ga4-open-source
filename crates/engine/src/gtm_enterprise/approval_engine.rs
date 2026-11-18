use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalStatus {
    Draft,
    PendingReview,
    Approved,
    Rejected,
    Published,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EnterpriseRole {
    Viewer,
    Editor,
    Approver,
    Publisher,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewComment {
    pub id: String,
    pub author: String,
    pub comment: String,
    pub timestamp_ms: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalWorkflow {
    pub workspace_id: String,
    pub status: ApprovalStatus,
    pub requested_by: Option<String>,
    pub reviewed_by: Option<String>,
    pub comments: Vec<ReviewComment>,
}

impl ApprovalWorkflow {
    pub fn new(workspace_id: &str) -> Self {
        Self {
            workspace_id: workspace_id.to_string(),
            status: ApprovalStatus::Draft,
            requested_by: None,
            reviewed_by: None,
            comments: Vec::new(),
        }
    }

    pub fn request_approval(&mut self, user_id: &str, role: EnterpriseRole) -> Result<(), String> {
        if matches!(role, EnterpriseRole::Viewer) {
            return Err("Viewers cannot request approval".to_string());
        }
        self.status = ApprovalStatus::PendingReview;
        self.requested_by = Some(user_id.to_string());
        Ok(())
    }

    pub fn approve(&mut self, approver_id: &str, role: EnterpriseRole) -> Result<(), String> {
        if !matches!(role, EnterpriseRole::Approver | EnterpriseRole::Publisher) {
            return Err("Only Approvers or Publishers can approve workflows".to_string());
        }
        if self.status != ApprovalStatus::PendingReview {
            return Err("Workflow must be pending review to approve".to_string());
        }
        self.status = ApprovalStatus::Approved;
        self.reviewed_by = Some(approver_id.to_string());
        Ok(())
    }

    pub fn publish(&mut self, publisher_id: &str, role: EnterpriseRole) -> Result<(), String> {
        if !matches!(role, EnterpriseRole::Publisher) {
            return Err("Only Publishers can publish versions".to_string());
        }
        if self.status != ApprovalStatus::Approved {
            return Err("Workflow must be approved prior to publishing".to_string());
        }
        self.status = ApprovalStatus::Published;
        self.reviewed_by = Some(publisher_id.to_string());
        Ok(())
    }

    pub fn add_comment(&mut self, author: &str, comment: &str) {
        self.comments.push(ReviewComment {
            id: format!("c_{}", self.comments.len() + 1),
            author: author.to_string(),
            comment: comment.to_string(),
            timestamp_ms: chrono::Utc::now().timestamp_millis(),
        });
    }
}
