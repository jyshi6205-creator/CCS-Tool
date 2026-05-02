import { loadConfig, getActiveProfile, findProfile, setActiveProfile, saveConfig } from '../lib/config.js';
import { applyProfile } from '../lib/apply.js';
import { findBoundProfileId, getCwd } from '../lib/project.js';

/**
 * Auto-switch profile based on current directory
 * Lookup order: project binding -> global active
 * @param {object} options - command options
 * @param {boolean} options.quiet - quiet mode (no output)
 */
export async function autoCommand(options = {}) {
  const config = loadConfig();
  const cwd = getCwd();
  const quiet = options.quiet || false;

  const boundId = findBoundProfileId(config, cwd);

  let profile;
  if (boundId) {
    profile = findProfile(config, boundId);
  }

  if (!profile) {
    profile = getActiveProfile(config);
    if (!profile) return;
  }

  // Check if already the active profile
  const active = getActiveProfile(config);
  if (active?.id === profile.id) return;

  applyProfile(profile);
  setActiveProfile(config, profile.id);
  saveConfig(config);

  if (!quiet) {
    console.log(`  ✓ 已切换到: ${profile.name}`);
  }
}
