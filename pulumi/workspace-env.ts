import fs from "node:fs";
import path from "node:path";

/** Load meta workspace `.env` (vault). Stack-local — not part of `@sargonpiraev/pulumi-apps`. */

const META_MARKER = path.join("schema", "meta__package.json");

export function findMetaWorkspaceRoot(fromDir: string = process.cwd()): string {
  let dir = path.resolve(fromDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, META_MARKER))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        "meta workspace root not found (walked up without schema/meta__package.json)",
      );
    }
    dir = parent;
  }
}

export function readEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function applyEnv(
  parsed: Record<string, string>,
  allow?: (key: string) => boolean,
): void {
  for (const [key, value] of Object.entries(parsed)) {
    if (allow && !allow(key)) continue;
    process.env[key] = value;
  }
}

/** Load meta workspace `.env` (SaaS keys). Then optional local `pulumi/.env` `PULUMI_*` only. */
export function loadWorkspaceEnv(fromDir: string = process.cwd()): string {
  const root = findMetaWorkspaceRoot(fromDir);
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error(`workspace .env missing at ${envPath}`);
  }
  applyEnv(readEnvFile(envPath));

  const localEnv = path.join(path.resolve(fromDir), ".env");
  if (
    fs.existsSync(localEnv) &&
    path.resolve(localEnv) !== path.resolve(envPath)
  ) {
    applyEnv(readEnvFile(localEnv), (key) => key.startsWith("PULUMI_"));
  }
  return envPath;
}
