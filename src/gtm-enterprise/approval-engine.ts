export interface ApprovalComment {
	id: string;
	author: string;
	entityName: string;
	comment: string;
	timestamp: number;
}

export interface ApprovalRequest {
	id: string;
	workspaceId: string;
	status: "PENDING" | "APPROVED" | "REJECTED";
	requestedBy: string;
	reviewedBy?: string;
	notes: string;
	comments: ApprovalComment[];
	createdAt: number;
	updatedAt: number;
}

export class ApprovalEngine {
	private requests = new Map<string, ApprovalRequest>();

	public submitForApproval(
		workspaceId: string,
		requestedBy: string,
		notes: string,
	): ApprovalRequest {
		const id = `apr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
		const now = Date.now();
		const request: ApprovalRequest = {
			id,
			workspaceId,
			status: "PENDING",
			requestedBy,
			notes,
			comments: [],
			createdAt: now,
			updatedAt: now,
		};
		this.requests.set(id, request);
		return request;
	}

	public addComment(
		requestId: string,
		author: string,
		entityName: string,
		comment: string,
	): ApprovalComment {
		const req = this.requests.get(requestId);
		if (!req) throw new Error("Approval request not found");

		const cId = `cmt_${Date.now()}`;
		const newComment: ApprovalComment = {
			id: cId,
			author,
			entityName,
			comment,
			timestamp: Date.now(),
		};
		req.comments.push(newComment);
		req.updatedAt = Date.now();
		return newComment;
	}

	public reviewRequest(
		requestId: string,
		reviewedBy: string,
		action: "APPROVE" | "REJECT",
	): ApprovalRequest {
		const req = this.requests.get(requestId);
		if (!req) throw new Error("Approval request not found");
		if (req.status !== "PENDING") {
			throw new Error(`Cannot review request with status: ${req.status}`);
		}

		req.status = action === "APPROVE" ? "APPROVED" : "REJECTED";
		req.reviewedBy = reviewedBy;
		req.updatedAt = Date.now();
		return req;
	}

	public getRequest(requestId: string): ApprovalRequest | undefined {
		return this.requests.get(requestId);
	}
}
