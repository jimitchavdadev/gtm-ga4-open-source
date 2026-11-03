import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { DatabaseManager } from "../src/db/connection";
import { AnalyticsRepository } from "../src/db/repository";

describe("Database Layer (Module 1)", () => {
	let dbManager: DatabaseManager;
	let repo: AnalyticsRepository;

	beforeEach(() => {
		dbManager = new DatabaseManager(":memory:");
		repo = new AnalyticsRepository(dbManager.getDb());
	});

	afterEach(() => {
		dbManager.close();
	});

	it("creates and retrieves an account", () => {
		const account = repo.createAccount({
			id: "acc_1",
			name: "Acme Corp",
			share_data: 1,
			gmp_org_id: "org_999",
		});

		expect(account.id).toBe("acc_1");
		expect(account.name).toBe("Acme Corp");
		expect(account.share_data).toBe(1);

		const fetched = repo.getAccount("acc_1");
		expect(fetched).not.toBeNull();
		expect(fetched?.name).toBe("Acme Corp");
		expect(fetched?.gmp_org_id).toBe("org_999");
	});

	it("creates and retrieves a container with usage context", () => {
		repo.createAccount({ id: "acc_1", name: "Acme Corp", share_data: 0 });

		const container = repo.createContainer({
			id: "cont_1",
			account_id: "acc_1",
			name: "Main Web Container",
			public_id: "GTM-ACME01",
			usage_context: "WEB",
			is_360: 1,
		});

		expect(container.public_id).toBe("GTM-ACME01");
		expect(container.is_360).toBe(1);

		const fetched = repo.getContainerByPublicId("GTM-ACME01");
		expect(fetched).not.toBeNull();
		expect(fetched?.name).toBe("Main Web Container");
	});

	it("manages workspaces with default flag", () => {
		repo.createAccount({ id: "acc_1", name: "Acme Corp", share_data: 0 });
		repo.createContainer({
			id: "cont_1",
			account_id: "acc_1",
			name: "Web",
			public_id: "GTM-TEST01",
			usage_context: "WEB",
			is_360: 0,
		});

		repo.createWorkspace({
			id: "ws_default",
			container_id: "cont_1",
			name: "Default Workspace",
			is_default: 1,
		});

		repo.createWorkspace({
			id: "ws_feature",
			container_id: "cont_1",
			name: "Feature Branch A",
			description: "Testing new tags",
			is_default: 0,
		});

		const workspaces = repo.getWorkspaces("cont_1");
		expect(workspaces.length).toBe(2);
		expect(workspaces[0]?.name).toBe("Default Workspace");
		expect(workspaces[1]?.name).toBe("Feature Branch A");
	});
});
