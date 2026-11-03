import type { EntityRepository } from "../db/entity-repository";

export async function handleGtmApi(
	req: Request,
	url: URL,
	entityRepo: EntityRepository,
	corsHeaders: Record<string, string>,
): Promise<Response | null> {
	// GET /api/v1/workspaces/:id/entities
	const entitiesMatch = url.pathname.match(
		/^\/api\/v1\/workspaces\/([^/]+)\/entities$/,
	);
	if (entitiesMatch?.[1]) {
		const workspaceId = entitiesMatch[1];
		if (req.method === "GET") {
			const type = url.searchParams.get("type") || undefined;
			const list = entityRepo.getEntities(workspaceId, type);
			return Response.json(list, { headers: corsHeaders });
		}
		if (req.method === "POST") {
			const body = (await req.json().catch(() => null)) as any;
			if (!body?.name || !body?.entity_type) {
				return Response.json(
					{ error: "name and entity_type are required" },
					{ status: 400, headers: corsHeaders },
				);
			}
			const entity = entityRepo.createEntity({
				id: `ent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
				workspace_id: workspaceId,
				entity_type: body.entity_type,
				name: body.name,
				data_json: JSON.stringify(body.data || {}),
				fingerprint: Math.random().toString(36).substring(2, 10),
			});
			return Response.json(entity, { status: 201, headers: corsHeaders });
		}
	}

	// PUT or DELETE /api/v1/entities/:id
	const entityMatch = url.pathname.match(/^\/api\/v1\/entities\/([^/]+)$/);
	if (entityMatch?.[1]) {
		const id = entityMatch[1];
		if (req.method === "PUT") {
			const body = (await req.json().catch(() => null)) as any;
			const ok = entityRepo.updateEntity(id, {
				name: body?.name,
				data_json: body?.data ? JSON.stringify(body.data) : undefined,
				fingerprint: Math.random().toString(36).substring(2, 10),
			});
			return Response.json({ success: ok }, { headers: corsHeaders });
		}
		if (req.method === "DELETE") {
			const ok = entityRepo.deleteEntity(id);
			return Response.json({ success: ok }, { headers: corsHeaders });
		}
	}

	// POST /api/v1/workspaces/:id/publish
	const publishMatch = url.pathname.match(
		/^\/api\/v1\/workspaces\/([^/]+)\/publish$/,
	);
	if (publishMatch?.[1] && req.method === "POST") {
		const workspaceId = publishMatch[1];
		const body = (await req.json().catch(() => null)) as any;
		const entities = entityRepo.getEntities(workspaceId);
		const containerId = body?.container_id || "default_container";
		const version = entityRepo.createVersion(
			containerId,
			body?.name || `Version ${Date.now()}`,
			body?.description || "Published via GTM UI",
			JSON.stringify(entities),
		);
		return Response.json(version, { status: 201, headers: corsHeaders });
	}

	// GET /api/v1/containers/:id/versions
	const versionsMatch = url.pathname.match(
		/^\/api\/v1\/containers\/([^/]+)\/versions$/,
	);
	if (versionsMatch?.[1] && req.method === "GET") {
		const containerId = versionsMatch[1];
		const versions = entityRepo.getVersions(containerId);
		return Response.json(versions, { headers: corsHeaders });
	}

	return null;
}
