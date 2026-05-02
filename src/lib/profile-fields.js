import { isValidUrl } from './validate.js';

/**
 * Profile field definitions (single source of truth)
 * Shared by apply.js, edit.js, profile-flow.js
 */
export const PROFILE_FIELDS = [
  { key: 'name',         label: '配置名称',            envKey: null },
  { key: 'base_url',     label: 'API Base URL',        envKey: 'ANTHROPIC_BASE_URL' },
  { key: 'auth_token',   label: 'API Key / Auth Token', envKey: 'ANTHROPIC_AUTH_TOKEN' },
  { key: 'model',        label: '模型名称',             envKey: 'ANTHROPIC_MODEL' },
  { key: 'opus_model',   label: 'Opus 模型',           envKey: 'ANTHROPIC_DEFAULT_OPUS_MODEL' },
  { key: 'sonnet_model', label: 'Sonnet 模型',         envKey: 'ANTHROPIC_DEFAULT_SONNET_MODEL' },
  { key: 'haiku_model',  label: 'Haiku 模型',          envKey: 'ANTHROPIC_DEFAULT_HAIKU_MODEL' },
];

/** Derived: env variable name -> profile field name mapping */
export const ENV_MAP = PROFILE_FIELDS
  .filter(f => f.envKey)
  .map(f => [f.envKey, f.key]);

/** URL field input validator (shared by edit.js / profile-flow.js) */
export const URL_VALIDATOR = v => {
  if (!v.trim()) return 'URL 不能为空';
  if (!isValidUrl(v)) return '必须以 http:// 或 https:// 开头';
  return true;
};
