import { run } from "./db";

export function logActivity(
  userId: number | null,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: string
) {
  run(
    `INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
    [userId, action, entityType, entityId, details ?? null]
  );
}
