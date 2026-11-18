import type { SqliteDatabase } from "./connection";
import { and, desc, eq, orm, schema } from "./orm-client";

export interface EntityRecord {
	id: string;
	workspace_id: string;
	entity_type: "TAG" | "TRIGGER" | "VARIABLE" | "FOLDER" | "ZONE";
	name: string;
	data_json: string;
	fingerprint: string;
	created_at: number;
	updated_at: number;
}

export interface VersionRecord {
	id: string;
	container_id: string;
	version_number: number;
	name?: string | null;
	description?: string | null;
	snapshot_json: string;
	created_at: number;
}

export class EntityRepository {
	constructor(private db: SqliteDatabase) {}

	public createEntity(
		entity: Omit<EntityRecord, "created_at" | "updated_at">,
	): EntityRecord {
		const now = Date.now();
		const query = orm
			.insert(schema.containerEntities)
			.values({
				id: entity.id,
				workspaceId: entity.workspace_id,
				entityType: entity.entity_type,
				name: entity.name,
				dataJson: entity.data_json,
				fingerprint: entity.fingerprint,
				createdAt: now,
				updatedAt: now,
			})
			.toSQL();

		this.db.prepare(query.sql).run(...(query.params as any[]));
		return { ...entity, created_at: now, updated_at: now };
	}

	public getEntities(workspaceId: string, entityType?: string): EntityRecord[] {
		const baseQuery = entityType
			? orm
					.select()
					.from(schema.containerEntities)
					.where(
						and(
							eq(schema.containerEntities.workspaceId, workspaceId),
							eq(schema.containerEntities.entityType, entityType),
						),
					)
					.orderBy(schema.containerEntities.name)
			: orm
					.select()
					.from(schema.containerEntities)
					.where(eq(schema.containerEntities.workspaceId, workspaceId))
					.orderBy(
						schema.containerEntities.entityType,
						schema.containerEntities.name,
					);

		const q = baseQuery.toSQL();
		const rows = this.db.prepare(q.sql).all(...(q.params as any[])) as any[];
		return rows.map((r) => ({
			id: r.id,
			workspace_id: r.workspace_id,
			entity_type: r.entity_type,
			name: r.name,
			data_json: r.data_json,
			fingerprint: r.fingerprint,
			created_at: r.created_at,
			updated_at: r.updated_at,
		}));
	}

	public updateEntity(
		id: string,
		updates: { name?: string; data_json?: string; fingerprint?: string },
	): boolean {
		const now = Date.now();
		const selQ = orm
			.select()
			.from(schema.containerEntities)
			.where(eq(schema.containerEntities.id, id))
			.toSQL();

		const existing = this.db
			.prepare(selQ.sql)
			.get(...(selQ.params as any[])) as any;
		if (!existing) return false;

		const updateValues: Record<string, any> = { updatedAt: now };
		if (updates.name !== undefined) updateValues.name = updates.name;
		if (updates.data_json !== undefined)
			updateValues.dataJson = updates.data_json;
		if (updates.fingerprint !== undefined)
			updateValues.fingerprint = updates.fingerprint;

		const upQ = orm
			.update(schema.containerEntities)
			.set(updateValues)
			.where(eq(schema.containerEntities.id, id))
			.toSQL();

		this.db.prepare(upQ.sql).run(...(upQ.params as any[]));
		return true;
	}

	public deleteEntity(id: string): boolean {
		const delQ = orm
			.delete(schema.containerEntities)
			.where(eq(schema.containerEntities.id, id))
			.toSQL();

		const res = this.db.prepare(delQ.sql).run(...(delQ.params as any[]));
		return res.changes > 0;
	}

	public createVersion(
		containerId: string,
		name: string,
		description: string,
		snapshotJson: string,
	): VersionRecord {
		const now = Date.now();
		const selQ = orm
			.select()
			.from(schema.containerVersions)
			.where(eq(schema.containerVersions.containerId, containerId))
			.toSQL();

		const existing = this.db.prepare(selQ.sql).all(...(selQ.params as any[]));
		const versionNumber = existing.length + 1;
		const id = `ver_${containerId}_${versionNumber}`;

		const insQ = orm
			.insert(schema.containerVersions)
			.values({
				id,
				containerId,
				versionNumber,
				name,
				description,
				snapshotJson,
				createdAt: now,
			})
			.toSQL();

		this.db.prepare(insQ.sql).run(...(insQ.params as any[]));
		return {
			id,
			container_id: containerId,
			version_number: versionNumber,
			name,
			description,
			snapshot_json: snapshotJson,
			created_at: now,
		};
	}

	public getVersions(containerId: string): VersionRecord[] {
		const q = orm
			.select()
			.from(schema.containerVersions)
			.where(eq(schema.containerVersions.containerId, containerId))
			.orderBy(desc(schema.containerVersions.versionNumber))
			.toSQL();

		const rows = this.db.prepare(q.sql).all(...(q.params as any[])) as any[];
		return rows.map((r) => ({
			id: r.id,
			container_id: r.container_id,
			version_number: r.version_number,
			name: r.name,
			description: r.description,
			snapshot_json: r.snapshot_json,
			created_at: r.created_at,
		}));
	}
}
