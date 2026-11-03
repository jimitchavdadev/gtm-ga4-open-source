import { describe, expect, it } from "bun:test";
import { Ga4ServerClient } from "../src/server-gtm/client";
import { FpidManager } from "../src/server-gtm/fpid";
import { TransformationPipeline } from "../src/server-gtm/transformations";

describe("Server-Side GTM & FPID Engine (Module 5)", () => {
	it("parses single and batch newline-separated GA4 wire requests", () => {
		const client = new Ga4ServerClient();
		expect(client.claimRequest("/g/collect")).toBe(true);
		expect(client.claimRequest("/other")).toBe(false);

		const batchRaw =
			"v=2&tid=G-123&cid=user1.1&en=page_view&dl=https%3A%2F%2Fsite.com%2Fhome&ep.author=John\n" +
			"v=2&tid=G-123&cid=user1.1&en=scroll&epn.percent_scrolled=90\n" +
			"v=2&tid=G-123&cid=user1.1&en=purchase&epn.value=150.00&ep.currency=USD";

		const parsed = client.parseBatchWirePayload(batchRaw);
		expect(parsed.length).toBe(3);
		expect(parsed[0]?.event_name).toBe("page_view");
		expect(parsed[0]?.event_params.author).toBe("John");
		expect(parsed[1]?.event_name).toBe("scroll");
		expect(parsed[1]?.event_params.percent_scrolled).toBe(90);
		expect(parsed[2]?.event_name).toBe("purchase");
		expect(parsed[2]?.event_params.value).toBe(150);
	});

	it("executes transformation pipeline with allowlisting, blocklisting, and hashing", () => {
		const pipeline = new TransformationPipeline();

		pipeline.addRule({
			id: "rule_hash",
			priority: 10,
			action: "HASH_SHA256",
			targetFields: ["email"],
		});

		pipeline.addRule({
			id: "rule_block",
			priority: 5,
			action: "BLOCKLIST",
			targetFields: ["ssn", "secret_token"],
		});

		pipeline.addRule({
			id: "rule_augment",
			priority: 1,
			action: "AUGMENT",
			targetFields: [],
			augmentData: { server_processed: true, region: "us-east-1" },
		});

		const rawEvent = {
			event_name: "lead_submit",
			client_id: "client_99",
			page_location: "https://site.com",
			event_params: {
				email: "User@Domain.com",
				ssn: "000-11-2222",
				interest: "cloud",
			},
		};

		const transformed = pipeline.apply(rawEvent);

		// Hashed email (lowercased)
		expect(transformed.event_params.email).toBe(
			"f7ee5ec7312165148b69fcca1d29075b14b8aef0b5048a332b18b88d09069fb7",
		);
		// Blocklisted field deleted
		expect(transformed.event_params.ssn).toBeUndefined();
		// Augmented fields added
		expect(transformed.event_params.server_processed).toBe(true);
		expect(transformed.event_params.region).toBe("us-east-1");
		// Untouched field preserved
		expect(transformed.event_params.interest).toBe("cloud");
	});

	it("generates, encrypts, and decrypts FPID with AES-256-GCM and HttpOnly cookie", () => {
		const fpidMgr = new FpidManager();
		const rawFpid = fpidMgr.generateFpid();
		expect(rawFpid.startsWith("FPID2.")).toBe(true);

		const encrypted = fpidMgr.encryptFpid(rawFpid);
		expect(encrypted).not.toBe(rawFpid);
		expect(encrypted.split(".").length).toBe(3); // iv.cipher.tag

		const decrypted = fpidMgr.decryptFpid(encrypted);
		expect(decrypted).toBe(rawFpid);

		// Invalid token decrypt test
		expect(fpidMgr.decryptFpid("tampered.token.here")).toBeNull();

		// Cookie generation
		const cookieHeader = fpidMgr.createSetCookieHeader(encrypted);
		expect(cookieHeader).toContain("HttpOnly; Secure; SameSite=Lax");
		expect(cookieHeader).toContain("Max-Age=63072000");
	});
});
