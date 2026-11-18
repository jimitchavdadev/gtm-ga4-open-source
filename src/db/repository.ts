import type { SqliteDatabase } from "./connection";
import { eq, orm, schema } from "./orm-client";

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
		const query = orm
			.insert(schema.accounts)
			.values({
				id: account.id,
				name: account.name,
				shareData: account.share_data,
				gmpOrgId: account.gmp_org_id ?? null,
				createdAt: now,
				updatedAt: now,
			})
			.toSQL();

		this.db.prepare(query.sql).run(...(query.params as any[]));
		return { ...account, created_at: now, updated_at: now };
	}

	public getAccount(id: string): AccountRecord | null {
		const query = orm
			.select()
			.from(schema.accounts)
			.where(eq(schema.accounts.id, id))
			.toSQL();

		const row = this.db
			.prepare(query.sql)
			.get(...(query.params as any[])) as any;
		return row
			? {
					id: row.id,
					name: row.name,
					share_data: row.share_data,
					gmp_org_id: row.gmp_org_id,
					created_at: row.created_at,
					updated_at: row.updated_at,
				}
			: null;
	}

	public createContainer(
		container: Omit<ContainerRecord, "created_at" | "updated_at">,
	): ContainerRecord {
		const now = Date.now();
		const query = orm
			.insert(schema.containers)
			.values({
				id: container.id,
				accountId: container.account_id,
				name: container.name,
				publicId: container.public_id,
				usageContext: container.usage_context,
				is360: container.is_360,
				createdAt: now,
				updatedAt: now,
			})
			.toSQL();

		this.db.prepare(query.sql).run(...(query.params as any[]));
		return { ...container, created_at: now, updated_at: now };
	}

	public getContainerByPublicId(publicId: string): ContainerRecord | null {
		const query = orm
			.select()
			.from(schema.containers)
			.where(eq(schema.containers.publicId, publicId))
			.toSQL();

		const row = this.db
			.prepare(query.sql)
			.get(...(query.params as any[])) as any;
		return row
			? {
					id: row.id,
					account_id: row.account_id,
					name: row.name,
					public_id: row.public_id,
					usage_context: row.usage_context,
					is_360: row.is_360,
					created_at: row.created_at,
					updated_at: row.updated_at,
				}
			: null;
	}

	public createWorkspace(
		workspace: Omit<WorkspaceRecord, "created_at" | "updated_at">,
	): WorkspaceRecord {
		const now = Date.now();
		const query = orm
			.insert(schema.workspaces)
			.values({
				id: workspace.id,
				containerId: workspace.container_id,
				name: workspace.name,
				description: workspace.description ?? null,
				isDefault: workspace.is_default,
				createdAt: now,
				updatedAt: now,
			})
			.toSQL();

		this.db.prepare(query.sql).run(...(query.params as any[]));
		return { ...workspace, created_at: now, updated_at: now };
	}

	public getWorkspaces(containerId: string): WorkspaceRecord[] {
		const query = orm
			.select()
			.from(schema.workspaces)
			.where(eq(schema.workspaces.containerId, containerId))
			.orderBy(schema.workspaces.createdAt)
			.toSQL();

		const rows = this.db
			.prepare(query.sql)
			.all(...(query.params as any[])) as any[];
		return rows.map((r) => ({
			id: r.id,
			container_id: r.container_id,
			name: r.name,
			description: r.description,
			is_default: r.is_default,
			created_at: r.created_at,
			updated_at: r.updated_at,
		}));
	}
}
