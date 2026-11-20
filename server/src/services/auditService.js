import { pool } from '../config/db.js';

export async function logAudit(workspaceId, userId, action, entityType, entityId, summary) {
  try {
    await pool.execute(
      'INSERT INTO audit_logs (workspace_id, user_id, action, entity_type, entity_id, summary) VALUES (?, ?, ?, ?, ?, ?)',
      [workspaceId, userId, action, entityType, entityId, summary]
    );
  } catch {
    // Non-blocking audit log
  }
}
