/**
 * Validate a profile's required fields and format
 * @param {object} profile - profile to validate
 * @returns {string[]} error messages, empty array means valid
 */
export function validateProfile(profile) {
  const errors = [];

  if (!profile.name || !profile.name.trim()) {
    errors.push('配置名称不能为空');
  }

  if (!profile.base_url || !profile.base_url.trim()) {
    errors.push('API Base URL 不能为空');
  } else if (!isValidUrl(profile.base_url)) {
    errors.push('API Base URL 必须以 http:// 或 https:// 开头');
  }

  if (!profile.auth_token || !profile.auth_token.trim()) {
    errors.push('API Key / Auth Token 不能为空');
  }

  if (!profile.model || !profile.model.trim()) {
    errors.push('模型名称不能为空');
  }

  return errors;
}

/**
 * Validate URL format (must start with http:// or https://)
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Validate profile name uniqueness (excluding a given profile ID)
 * @param {string} name - name to validate
 * @param {object[]} profiles - existing profiles
 * @param {string|null} excludeId - profile ID to exclude (used when editing)
 * @returns {boolean} whether the name is available
 */
export function validateProfileName(name, profiles, excludeId = null) {
  return !profiles.some(p => p.name === name && p.id !== excludeId);
}
