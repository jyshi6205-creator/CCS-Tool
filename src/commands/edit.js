import { select, input, confirm } from '@inquirer/prompts';
import { loadConfig, getActiveProfile, findProfile, updateProfile, setActiveProfile, saveConfig } from '../lib/config.js';
import { applyProfile } from '../lib/apply.js';
import { validateProfile, isValidUrl } from '../lib/validate.js';
import { printHeader, printSuccess, printWarning, printInfo, printError, guardIfEmpty } from '../lib/ui.js';
import { PROFILE_FIELDS, URL_VALIDATOR } from '../lib/profile-fields.js';

const FIELD_MAP = Object.fromEntries(PROFILE_FIELDS.map(f => [f.key, { prompt: f.label }]));
FIELD_MAP.base_url.validate = URL_VALIDATOR;

/**
 * Edit a profile
 * Two modes: quick edit a single field (--field) or full interactive edit
 * @param {string|undefined} profileArg - profile name or ID
 * @param {object} options - command options
 * @param {string} options.field - field name to edit
 */
export async function editCommand(profileArg, options) {
  printHeader();

  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  // Find profile: by argument or interactive selection
  let profile;
  if (profileArg) {
    profile = findProfile(config, profileArg);
    if (!profile) {
      printError(`未找到配置: ${profileArg}`);
      return;
    }
  } else {
    const choices = config.profiles.map(p => ({
      name: p.name,
      value: p.id,
      description: p.model,
    }));
    const selected = await select({
      message: '选择要编辑的配置:',
      choices,
    });
    profile = config.profiles.find(p => p.id === selected);
    if (!profile) return;
  }

  const selectedId = profile.id;
  let updates = {};

  if (options.field && FIELD_MAP[options.field]) {
    // Quick-edit a single field
    const field = FIELD_MAP[options.field];
    const value = await input({
      message: `${field.prompt}:`,
      default: profile[options.field] || '',
      validate: field.validate,
    });
    updates[options.field] = value.trim() || undefined;
    if (options.field === 'auth_token' && !value.trim()) {
      printWarning('Token 不能为空，保持不变');
      return;
    }
  } else if (options.field) {
    printError(`未知字段: ${options.field}`);
    printInfo(`可用字段: ${Object.keys(FIELD_MAP).join(', ')}`);
    return;
  } else {
    // Full edit
    console.log();
    printInfo(`编辑: ${profile.name}`);
    console.log();

    const name = await input({
      message: `配置名称 (${profile.name}):`,
      default: profile.name,
    });

    const base_url = await input({
      message: `API Base URL (${profile.base_url}):`,
      default: profile.base_url,
      validate: FIELD_MAP.base_url.validate,
    });

    const auth_token = await input({
      message: 'API Key / Auth Token (回车保持不变):',
      default: '',
    });

    const model = await input({
      message: `模型名称 (${profile.model}):`,
      default: profile.model,
    });

    const opus_model = await input({
      message: `Opus 模型 (${profile.opus_model || '默认'}):`,
      default: profile.opus_model || '',
    });

    const sonnet_model = await input({
      message: `Sonnet 模型 (${profile.sonnet_model || '默认'}):`,
      default: profile.sonnet_model || '',
    });

    const haiku_model = await input({
      message: `Haiku 模型 (${profile.haiku_model || '默认'}):`,
      default: profile.haiku_model || '',
    });

    updates = {
      name: name.trim(),
      base_url: base_url.trim(),
      model: model.trim(),
      opus_model: opus_model.trim() || undefined,
      sonnet_model: sonnet_model.trim() || undefined,
      haiku_model: haiku_model.trim() || undefined,
    };

    if (auth_token.trim()) {
      updates.auth_token = auth_token.trim();
    }
  }

  // Validate, confirm, save
  const merged = { ...profile, ...updates };
  const errors = validateProfile(merged);
  if (errors.length > 0) {
    errors.forEach(e => printError(e));
    return;
  }

  const ok = await confirm({ message: '确认保存修改?', default: true });
  if (!ok) {
    printWarning('已取消');
    return;
  }

  updateProfile(config, selectedId, updates);
  printSuccess(`已更新: ${updates.name || profile.name}`);

  // If editing the active profile, sync changes to settings.json
  const active = getActiveProfile(config);
  if (active?.id === selectedId) {
    const refreshed = config.profiles.find(p => p.id === selectedId);
    applyProfile(refreshed);
    setActiveProfile(config, refreshed.id);
    saveConfig(config);
    printInfo('当前激活的配置已同步更新');
  }
}
