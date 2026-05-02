import fs from 'node:fs';
import { CLAUDE_SETTINGS } from '../constants.js';
import { acquireLock, releaseLock } from './lock.js';

/**
 * Read ~/.claude/settings.json
 * @returns {object} settings object, or empty object if file missing / parse error
 */
export function loadClaudeSettings() {
  if (!fs.existsSync(CLAUDE_SETTINGS)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(CLAUDE_SETTINGS, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Write ~/.claude/settings.json
 * @param {object} settings - settings object to write
 */
export function saveClaudeSettings(settings) {
  acquireLock('settings');
  try {
    fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2), 'utf-8');
  } finally {
    releaseLock('settings');
  }
}
