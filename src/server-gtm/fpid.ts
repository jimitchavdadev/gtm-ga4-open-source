import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export class FpidManager {
	private secretKey: Buffer;

	constructor(secret32Bytes?: string) {
		if (secret32Bytes) {
			this.secretKey = Buffer.from(secret32Bytes, "hex");
		} else {
			this.secretKey = randomBytes(32);
		}
	}

	public generateFpid(): string {
		const seed = randomBytes(16).toString("hex");
		const timestamp = Math.floor(Date.now() / 1000);
		return `FPID2.${timestamp}.${seed}`;
	}

	public encryptFpid(fpid: string): string {
		const iv = randomBytes(12);
		const cipher = createCipheriv("aes-256-gcm", this.secretKey, iv);
		let encrypted = cipher.update(fpid, "utf8", "hex");
		encrypted += cipher.final("hex");
		const tag = cipher.getAuthTag().toString("hex");
		return `${iv.toString("hex")}.${encrypted}.${tag}`;
	}

	public decryptFpid(encryptedToken: string): string | null {
		try {
			const [ivHex, cipherHex, tagHex] = encryptedToken.split(".");
			if (!ivHex || !cipherHex || !tagHex) return null;

			const iv = Buffer.from(ivHex, "hex");
			const decipher = createDecipheriv("aes-256-gcm", this.secretKey, iv);
			decipher.setAuthTag(Buffer.from(tagHex, "hex"));
			let decrypted = decipher.update(cipherHex, "hex", "utf8");
			decrypted += decipher.final("utf8");
			return decrypted;
		} catch {
			return null;
		}
	}

	public createSetCookieHeader(
		encryptedValue: string,
		cookieName = "FPID",
		maxAgeSeconds = 63072000, // 2 years
	): string {
		return `${cookieName}=${encryptedValue}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; Secure; SameSite=Lax`;
	}
}
