export interface DataRedactionConfig {
	redactEmail: boolean;
	stripQueryParameters: string[];
}

export class DataRedactionEngine {
	private static readonly EMAIL_REGEX =
		/[a-zA-Z0-9._%+-]+(?:@|%40)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

	public static redactEmails(input: string): string {
		return input.replace(this.EMAIL_REGEX, "(redacted)");
	}

	public static redactUrl(
		urlStr: string,
		stripParams: string[] = [],
		redactEmail = true,
	): string {
		try {
			const parsed = new URL(urlStr);
			for (const p of stripParams) {
				parsed.searchParams.delete(p);
			}

			let sanitized = parsed.toString();
			if (redactEmail) {
				sanitized = this.redactEmails(sanitized);
			}
			return sanitized;
		} catch {
			let res = urlStr;
			for (const p of stripParams) {
				const regex = new RegExp(`([?&])${p}=[^&#]*`, "gi");
				res = res.replace(regex, "$1");
			}
			res = res.replace(/[?&]+$/, "").replace(/\?&/, "?");
			if (redactEmail) {
				res = this.redactEmails(res);
			}
			return res;
		}
	}

	public static sanitizeEventParams(
		params: Record<string, any>,
		config: DataRedactionConfig,
	): Record<string, any> {
		const sanitized: Record<string, any> = {};

		for (const [key, val] of Object.entries(params)) {
			if (typeof val === "string") {
				if (
					key === "page_location" ||
					key === "dl" ||
					key === "page_referrer" ||
					key === "dr"
				) {
					sanitized[key] = this.redactUrl(
						val,
						config.stripQueryParameters,
						config.redactEmail,
					);
				} else if (config.redactEmail) {
					sanitized[key] = this.redactEmails(val);
				} else {
					sanitized[key] = val;
				}
			} else if (val && typeof val === "object" && !Array.isArray(val)) {
				sanitized[key] = this.sanitizeEventParams(val, config);
			} else {
				sanitized[key] = val;
			}
		}

		return sanitized;
	}
}
