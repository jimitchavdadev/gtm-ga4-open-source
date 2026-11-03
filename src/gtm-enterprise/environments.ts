export interface EnvironmentConfig {
	id: string;
	containerPublicId: string;
	name: string;
	type: "LIVE" | "LATEST" | "USER";
	authToken: string;
	previewToken: string;
}

export class EnvironmentManager {
	private environments = new Map<string, EnvironmentConfig>();

	public createEnvironment(
		containerPublicId: string,
		name: string,
		type: "LIVE" | "LATEST" | "USER" = "USER",
	): EnvironmentConfig {
		const id = `env_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
		const authToken = Math.random().toString(36).substring(2, 12);
		const previewToken = Math.random().toString(36).substring(2, 8);

		const env: EnvironmentConfig = {
			id,
			containerPublicId,
			name,
			type,
			authToken,
			previewToken,
		};
		this.environments.set(id, env);
		return env;
	}

	public generateSnippetUrl(
		envId: string,
		baseUrl = "https://metrics.brand.com",
	): string {
		const env = this.environments.get(envId);
		if (!env) throw new Error("Environment not found");

		if (env.type === "LIVE") {
			return `${baseUrl}/gtm.js?id=${env.containerPublicId}`;
		}

		return `${baseUrl}/gtm.js?id=${env.containerPublicId}&gtm_auth=${env.authToken}&gtm_preview=${env.id}&gtm_cookies_win=x`;
	}

	public validateAuth(envId: string, providedAuth: string): boolean {
		const env = this.environments.get(envId);
		if (!env) return false;
		return env.authToken === providedAuth;
	}
}
