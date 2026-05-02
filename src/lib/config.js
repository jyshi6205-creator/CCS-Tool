import fs from 'node:fs';
import { CONFIG_DIR, CONFIG_FILE } from '../constants.js';
import { acquireLock, releaseLock } from './lock.js';

/** Ensure config directory exists */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Load the profile registry
 * @returns {{ version: number, active: string|null, profiles: object[] }} config object
 */
export function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return { version: 2, active: null, profiles: [], projectBindings: {} };
  }
  const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const config = JSON.parse(raw);
  // Backward-compat with v1 schema: add projectBindings field
  if (!config.projectBindings) config.projectBindings = {};
  return config;
}

/**
 * Persist the profile registry
 * @param {object} config - config object
 */
export function saveConfig(config) {
  ensureConfigDir();
  acquireLock('config');
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } finally {
    releaseLock('config');
  }
}

/**
 * Find a profile by name or ID
 * @param {object} config - config object
 * @param {string} identifier - profile name or ID
 * @returns {object|null} matched profile, or null if not found
 */
export function findProfile(config, identifier) {
  return config.profiles.find(p => p.id === identifier || p.name === identifier) || null;
}

/**
 * Get the currently active profile
 * @param {object} config - config object
 * @returns {object|null} active profile, or null if none active
 */
export function getActiveProfile(config) {
  if (!config.active) return null;
  return config.profiles.find(p => p.id === config.active) || null;
}

/**
 * Set the active profile (in memory only, does not persist)
 * @param {object} config - config object
 * @param {string} profileId - profile ID to activate
 */
export function setActiveProfile(config, profileId) {
  config.active = profileId;
}

/**
 * Add a profile and persist
 * @param {object} config - config object
 * @param {object} profile - new profile
 */
export function addProfile(config, profile) {
  config.profiles.push(profile);
  saveConfig(config);
}

/**
 * Delete a profile and persist
 * If deleting the active profile, fall back to the first remaining profile
 * @param {object} config - config object
 * @param {string} profileId - profile ID to delete
 */
export function removeProfile(config, profileId) {
  config.profiles = config.profiles.filter(p => p.id !== profileId);
  if (config.active === profileId) {
    config.active = config.profiles.length > 0 ? config.profiles[0].id : null;
  }
  saveConfig(config);
}

/**
 * Update profile fields and persist
 * @param {object} config - config object
 * @param {string} profileId - profile ID to update
 * @param {object} updates - fields to update
 * @returns {boolean} whether the profile was found and updated
 */
export function updateProfile(config, profileId, updates) {
  const idx = config.profiles.findIndex(p => p.id === profileId);
  if (idx === -1) return false;
  config.profiles[idx] = { ...config.profiles[idx], ...updates };
  saveConfig(config);
  return true;
}

/**
 * Generate a unique profile ID
 * Format: p-<base36 timestamp><4 random chars>
 * @returns {string} unique ID
 */
export function generateId() {
  return 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
