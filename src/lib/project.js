import fs from 'node:fs';
import path from 'node:path';

/** Project marker file name */
const MARKER_FILE = '.ccs-tool.json';

/**
 * Get the absolute path of the current working directory
 * @returns {string}
 */
export function getCwd() {
  return process.cwd();
}

/**
 * Bind a project directory to a profile (in memory only, does not persist)
 * Also writes a marker file at the project root
 * @param {object} config - config object
 * @param {string} projectPath - absolute project directory path
 * @param {string} profileId - profile ID
 * @param {string} profileName - profile name (for marker file)
 */
export function bindProject(config, projectPath, profileId, profileName) {
  if (!config.projectBindings) config.projectBindings = {};
  config.projectBindings[projectPath] = {
    profileId,
    pinnedAt: new Date().toISOString(),
  };
  writeMarker(projectPath, profileName);
}

/**
 * Unbind a project directory (in memory only, does not persist)
 * @param {object} config - config object
 * @param {string} projectPath - absolute project directory path
 */
export function unbindProject(config, projectPath) {
  if (config.projectBindings) {
    delete config.projectBindings[projectPath];
  }
  removeMarker(projectPath);
}

/**
 * Find the profile ID bound to the current directory
 * Lookup order: central registry -> upward marker file search -> null
 * @param {object} config - config object
 * @param {string} cwd - current working directory
 * @returns {string|null} bound profile ID, or null
 */
export function findBoundProfileId(config, cwd) {
  // 1. Exact match in central registry
  if (config.projectBindings?.[cwd]) {
    return config.projectBindings[cwd].profileId;
  }

  // 2. Search upward for .ccs-tool.json marker file
  const markerProfile = searchMarker(cwd);
  if (markerProfile) {
    // Look up profile by name
    const profile = config.profiles?.find(p => p.name === markerProfile);
    if (profile) return profile.id;
  }

  return null;
}

/**
 * List all project bindings
 * @param {object} config - config object
 * @returns {Array<{path: string, profileId: string, pinnedAt: string, profileName: string}>}
 */
export function listBindings(config) {
  if (!config.projectBindings) return [];
  return Object.entries(config.projectBindings).map(([projectPath, binding]) => {
    const profile = config.profiles?.find(p => p.id === binding.profileId);
    return {
      path: projectPath,
      profileId: binding.profileId,
      profileName: profile?.name || '(已删除)',
      pinnedAt: binding.pinnedAt,
    };
  });
}

/**
 * Write .ccs-tool.json marker file at the project root
 * @param {string} projectPath - project directory
 * @param {string} profileName - profile name
 */
function writeMarker(projectPath, profileName) {
  const markerPath = path.join(projectPath, MARKER_FILE);
  const data = {
    profile: profileName,
    pinned_at: new Date().toISOString(),
  };
  fs.writeFileSync(markerPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Remove the marker file from the project root
 * @param {string} projectPath - project directory
 */
function removeMarker(projectPath) {
  const markerPath = path.join(projectPath, MARKER_FILE);
  try {
    fs.unlinkSync(markerPath);
  } catch {}
}

/**
 * Search upward from current directory for a .ccs-tool.json marker file
 * @param {string} startDir - starting directory
 * @returns {string|null} profile name from the marker file, or null
 */
function searchMarker(startDir) {
  let dir = startDir;
  while (true) {
    const markerPath = path.join(dir, MARKER_FILE);
    if (fs.existsSync(markerPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(markerPath, 'utf-8'));
        if (data.profile) return data.profile;
      } catch {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  return null;
}
