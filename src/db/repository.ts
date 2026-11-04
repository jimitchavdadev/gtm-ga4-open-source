import type { SqliteDatabase } from "./connection";

export interface AccountRecord {
	id: string;
	name: string;
	share_data: number;
	gmp_org_id?: string | null;
	created_at: number;
	updated_at: number;
}

export interface ContainerRecord {
	id: string;
	account_id: string;
	name: string;
	public_id: string;
	usage_context: string;
	is_360: number;
	created_at: number;
	updated_at: number;
}

export interface WorkspaceRecord {
	id: string;
	container_id: string;
	name: string;
	description?: string | null;
	is_default: number;
	created_at: number;
	updated_at: number;
}

export class AnalyticsRepository {
	constructor(private db: SqliteDatabase) {}

	public createAccount(
		account: Omit<AccountRecord, "created_at" | "updated_at">,
	): AccountRecord {
		const now = Date.now();
		const stmt = this.db.prepare(`
      INSERT INTO accounts (id, name, share_data, gmp_org_id, created_at, updated_at)
      VALUES ($id, $name, $share_data, $gmp_org_id, $created_at, $updated_at)
    `);
		stmt.run({
			$id: account.id,
			$name: account.name,
			$share_data: account.share_data,
			$gmp_org_id: account.gmp_org_id ?? null,
			$created_at: now,
			$updated_at: now,
		});
		return { ...account, created_at: now, updated_at: now };
	}

	public getAccount(id: string): AccountRecord | null {
		const stmt = this.db.prepare("SELECT * FROM accounts WHERE id = ?");
		return stmt.get(id) as unknown as AccountRecord | null;
	}

	public createContainer(
		container: Omit<ContainerRecord, "created_at" | "updated_at">,
	): ContainerRecord {
		const now = Date.now();
		const stmt = this.db.prepare(`
      INSERT INTO containers (id, account_id, name, public_id, usage_context, is_360, created_at, updated_at)
      VALUES ($id, $account_id, $name, $public_id, $usage_context, $is_360, $created_at, $updated_at)
    `);
		stmt.run({
			$id: container.id,
			$account_id: container.account_id,
			$name: container.name,
			$public_id: container.public_id,
			$usage_context: container.usage_context,
			$is_360: container.is_360,
			$created_at: now,
			$updated_at: now,
		});
		return { ...container, created_at: now, updated_at: now };
	}

	public getContainerByPublicId(publicId: string): ContainerRecord | null {
		const stmt = this.db.prepare(
			"SELECT * FROM containers WHERE public_id = ?",
		);
		return stmt.get(publicId) as unknown as ContainerRecord | null;
	}

	public createWorkspace(
		workspace: Omit<WorkspaceRecord, "created_at" | "updated_at">,
	): WorkspaceRecord {
		const now = Date.now();
		const stmt = this.db.prepare(`
      INSERT INTO workspaces (id, container_id, name, description, is_default, created_at, updated_at)
      VALUES ($id, $container_id, $name, $description, $is_default, $created_at, $updated_at)
    `);
		stmt.run({
			$id: workspace.id,
			$container_id: workspace.container_id,
			$name: workspace.name,
			$description: workspace.description ?? null,
			$is_default: workspace.is_default,
			$created_at: now,
			$updated_at: now,
		});
		return { ...workspace, created_at: now, updated_at: now };
	}

	public getWorkspaces(containerId: string): WorkspaceRecord[] {
		const stmt = this.db.prepare(
			"SELECT * FROM workspaces WHERE container_id = ? ORDER BY created_at ASC",
		);
		return stmt.all(containerId) as unknown as WorkspaceRecord[];
	}
}
