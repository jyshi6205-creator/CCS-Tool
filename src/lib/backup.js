import fs from 'node:fs';
import path from 'node:path';
import { BACKUP_DIR, CLAUDE_SETTINGS, MAX_BACKUPS } from '../constants.js';

/**
 * List all backup files, sorted newest-first
 * @returns {string[]} backup file names
 */
export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('settings-') && f.endsWith('.json'))
    .sort()
    .reverse();
}

/**
 * Back up the current ~/.claude/settings.json
 * Auto-prunes old backups exceeding MAX_BACKUPS
 */
export function backupSettings() {
  if (!fs.existsSync(CLAUDE_SETTINGS)) return;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `settings-${timestamp}.json`);

  fs.copyFileSync(CLAUDE_SETTINGS, backupFile);
  cleanOldBackups();
}

/** Prune old backup files exceeding the retention limit */
function cleanOldBackups() {
  const files = listBackups();
  for (const file of files.slice(MAX_BACKUPS)) {
    fs.unlinkSync(path.join(BACKUP_DIR, file));
  }
}
