import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIRS = ["src", "app", "components", "hooks", "tests", "crates/engine/src"];
const EXTENSIONS = [".ts", ".tsx", ".rs", ".js"];
const MAX_LINES = 200;

function checkDir(dir: string, failures: string[]) {
	try {
		const entries = readdirSync(dir);
		for (const entry of entries) {
			const full = join(dir, entry);
			const stat = statSync(full);
			if (stat.isDirectory()) {
				checkDir(full, failures);
			} else if (EXTENSIONS.some((ext) => full.endsWith(ext))) {
				const content = readFileSync(full, "utf-8");
				const lines = content.split("\n").length;
				if (lines >= MAX_LINES) {
					failures.push(`${full} (${lines} lines >= ${MAX_LINES})`);
				}
			}
		}
	} catch {
		// Ignore if directory doesn't exist
	}
}

const failures: string[] = [];
for (const dir of DIRS) {
	checkDir(dir, failures);
}

if (failures.length > 0) {
	console.error(`❌ Found ${failures.length} files with >= ${MAX_LINES} lines:`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
} else {
	console.log(`✅ All source files are strictly < ${MAX_LINES} lines.`);
}
