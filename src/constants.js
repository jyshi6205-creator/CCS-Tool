import path from 'node:path';
import os from 'node:os';

/** User home directory */
export const HOME = os.homedir();

/** Config directory, overridable via CCS_CONFIG env var */
export const CONFIG_DIR = process.env.CCS_CONFIG || path.join(HOME, '.ccs-tool');

/** Profile registry file path */
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/** Backup directory */
export const BACKUP_DIR = path.join(CONFIG_DIR, 'backups');

/** Claude Code settings path, overridable via CCS_CLAUDE_SETTINGS env var */
export const CLAUDE_SETTINGS = process.env.CCS_CLAUDE_SETTINGS || path.join(HOME, '.claude', 'settings.json');

/** Max number of backups to keep */
export const MAX_BACKUPS = 10;

/** Tool version */
export const VERSION = '1.1.1';

/** Anthropic API version */
export const ANTHROPIC_API_VERSION = '2023-06-01';
