import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Coolit Pro uses Node's built-in SQLite module (node:sqlite). No native
// binaries to download, no external database service required to run.
// For production, point DB_PATH at a persistent disk/volume. See DEPLOYMENT.md
// for notes on migrating to a hosted Postgres/libSQL database if the team
// outgrows a single SQLite file.

declare global {
  var __coolitDb: DatabaseSync | undefined;
}

function resolveDbPath() {
  const configured = process.env.DB_PATH;
  // Statically-scoped default path (kept literal so bundlers don't trace the
  // whole project as a dependency of this file). Set DB_PATH to override —
  // e.g. to point at a mounted persistent volume in production.
  const resolved = !configured
    ? path.join(process.cwd(), "data", "coolit.db")
    : path.isAbsolute(configured)
      ? configured
      : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return resolved;
}

function createConnection(): DatabaseSync {
  const dbPath = resolveDbPath();
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  const schemaPath = path.join(process.cwd(), "src/lib/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return db;
}

export function getDb(): DatabaseSync {
  if (!global.__coolitDb) {
    global.__coolitDb = createConnection();
  }
  return global.__coolitDb;
}

// Small helpers so call sites read like a normal query builder instead of
// juggling prepare/run/get everywhere.

// node:sqlite returns row objects that aren't plain Object.prototype
// instances, which React's server/client serialization boundary rejects
// ("Only plain objects... can be passed to Client Components"). Spreading
// each row into a fresh object literal fixes that everywhere at once.
function toPlain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function all<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T[] {
  const stmt = getDb().prepare(sql);
  return (stmt.all(...(params as never[])) as unknown[]).map((row) => toPlain<T>(row));
}

export function one<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T | undefined {
  const stmt = getDb().prepare(sql);
  const row = stmt.get(...(params as never[]));
  return row === undefined ? undefined : toPlain<T>(row);
}

export function run(
  sql: string,
  params: unknown[] = []
): { lastInsertRowid: number | bigint; changes: number | bigint } {
  const stmt = getDb().prepare(sql);
  return stmt.run(...(params as never[]));
}

export function nowIso(): string {
  return new Date().toISOString();
}
