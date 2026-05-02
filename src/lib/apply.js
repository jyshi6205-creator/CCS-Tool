import { backupSettings } from './backup.js';
import { loadClaudeSettings, saveClaudeSettings } from './settings.js';
import { ENV_MAP } from './profile-fields.js';

/**
 * Apply a profile to ~/.claude/settings.json
 * Backs up current settings first, then writes profile fields to the env section
 * @param {object} profile - profile object
 * @returns {object} the written settings object
 */
export function applyProfile(profile) {
  backupSettings();

  const settings = loadClaudeSettings();
  if (!settings.env) settings.env = {};

  for (const [envKey, profileKey] of ENV_MAP) {
    settings.env[envKey] = profile[profileKey] || '';
  }

  // Fall back to main model for unset sub-model fields
  if (!profile.opus_model) settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL = profile.model;
  if (!profile.sonnet_model) settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL = profile.model;
  if (!profile.haiku_model) settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = profile.model;

  saveClaudeSettings(settings);
  return settings;
}

/**
 * Import config from current ~/.claude/settings.json
 * @returns {object} extracted profile fields
 */
export function importFromSettings() {
  const settings = loadClaudeSettings();
  const env = settings.env || {};

  return {
    base_url: env.ANTHROPIC_BASE_URL || '',
    auth_token: env.ANTHROPIC_AUTH_TOKEN || '',
    model: env.ANTHROPIC_MODEL || '',
    opus_model: env.ANTHROPIC_DEFAULT_OPUS_MODEL || '',
    sonnet_model: env.ANTHROPIC_DEFAULT_SONNET_MODEL || '',
    haiku_model: env.ANTHROPIC_DEFAULT_HAIKU_MODEL || '',
  };
}
