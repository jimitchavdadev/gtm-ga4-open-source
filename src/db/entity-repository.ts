import type { SqliteDatabase } from "./connection";

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
		const stmt = this.db.prepare(`
      INSERT INTO container_entities (id, workspace_id, entity_type, name, data_json, fingerprint, created_at, updated_at)
      VALUES ($id, $workspace_id, $entity_type, $name, $data_json, $fingerprint, $created_at, $updated_at)
    `);
		stmt.run({
			$id: entity.id,
			$workspace_id: entity.workspace_id,
			$entity_type: entity.entity_type,
			$name: entity.name,
			$data_json: entity.data_json,
			$fingerprint: entity.fingerprint,
			$created_at: now,
			$updated_at: now,
		});
		return { ...entity, created_at: now, updated_at: now };
	}

	public getEntities(workspaceId: string, entityType?: string): EntityRecord[] {
		if (entityType) {
			const stmt = this.db.prepare(
				"SELECT * FROM container_entities WHERE workspace_id = ? AND entity_type = ? ORDER BY name ASC",
			);
			return stmt.all(workspaceId, entityType) as unknown as EntityRecord[];
		}
		const stmt = this.db.prepare(
			"SELECT * FROM container_entities WHERE workspace_id = ? ORDER BY entity_type, name ASC",
		);
		return stmt.all(workspaceId) as unknown as EntityRecord[];
	}

	public updateEntity(
		id: string,
		updates: { name?: string; data_json?: string; fingerprint?: string },
	): boolean {
		const now = Date.now();
		const existing = this.db
			.prepare("SELECT * FROM container_entities WHERE id = ?")
			.get(id) as unknown as EntityRecord | null;
		if (!existing) return false;

		const stmt = this.db.prepare(`
      UPDATE container_entities
      SET name = $name, data_json = $data_json, fingerprint = $fingerprint, updated_at = $updated_at
      WHERE id = $id
    `);
		stmt.run({
			$id: id,
			$name: updates.name ?? existing.name,
			$data_json: updates.data_json ?? existing.data_json,
			$fingerprint: updates.fingerprint ?? existing.fingerprint,
			$updated_at: now,
		});
		return true;
	}

	public deleteEntity(id: string): boolean {
		const stmt = this.db.prepare("DELETE FROM container_entities WHERE id = ?");
		const res = stmt.run(id);
		return res.changes > 0;
	}

	public createVersion(
		containerId: string,
		name: string,
		description: string,
		snapshotJson: string,
	): VersionRecord {
		const now = Date.now();
		const countStmt = this.db.prepare(
			"SELECT COUNT(*) as count FROM container_versions WHERE container_id = ?",
		);
		const countRes = countStmt.get(containerId) as { count: number };
		const versionNumber = (countRes?.count ?? 0) + 1;
		const id = `ver_${containerId}_${versionNumber}`;

		const stmt = this.db.prepare(`
      INSERT INTO container_versions (id, container_id, version_number, name, description, snapshot_json, created_at)
      VALUES ($id, $container_id, $version_number, $name, $description, $snapshot_json, $created_at)
    `);
		stmt.run({
			$id: id,
			$container_id: containerId,
			$version_number: versionNumber,
			$name: name,
			$description: description,
			$snapshot_json: snapshotJson,
			$created_at: now,
		});
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
		const stmt = this.db.prepare(
			"SELECT * FROM container_versions WHERE container_id = ? ORDER BY version_number DESC",
		);
		return stmt.all(containerId) as unknown as VersionRecord[];
	}
}
