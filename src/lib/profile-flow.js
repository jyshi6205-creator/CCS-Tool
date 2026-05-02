import { input, confirm } from '@inquirer/prompts';
import { addProfile, generateId, setActiveProfile, saveConfig } from './config.js';
import { applyProfile } from './apply.js';
import { validateProfile, validateProfileName, isValidUrl } from './validate.js';
import { printSuccess, printInfo, printWarning, printError, maskToken } from './ui.js';

/**
 * Interactive flow to add a new profile
 * Steps: input -> preview -> validate -> confirm -> save -> optional switch
 * @param {object} config - current config object
 */
export async function addProfileFlow(config) {
  const name = await input({
    message: '配置名称:',
    validate: v => v.trim() ? true : '名称不能为空',
  });

  const base_url = await input({
    message: 'API Base URL:',
    default: 'https://api.anthropic.com',
    validate: v => {
      if (!v.trim()) return 'URL 不能为空';
      if (!isValidUrl(v)) return '必须以 http:// 或 https:// 开头';
      return true;
    },
  });

  const auth_token = await input({
    message: 'API Key / Auth Token:',
    validate: v => v.trim() ? true : 'Token 不能为空',
  });

  const model = await input({
    message: '模型名称:',
    default: 'claude-sonnet-4-20250514',
    validate: v => v.trim() ? true : '模型名称不能为空',
  });

  const opus_model = await input({
    message: 'Opus 模型 (回车跳过，使用默认):',
    default: '',
  });

  const sonnet_model = await input({
    message: 'Sonnet 模型 (回车跳过，使用默认):',
    default: '',
  });

  const haiku_model = await input({
    message: 'Haiku 模型 (回车跳过，使用默认):',
    default: '',
  });

  const profile = {
    id: generateId(),
    name: name.trim(),
    base_url: base_url.trim(),
    auth_token: auth_token.trim(),
    model: model.trim(),
    opus_model: opus_model.trim() || undefined,
    sonnet_model: sonnet_model.trim() || undefined,
    haiku_model: haiku_model.trim() || undefined,
    created_at: new Date().toISOString(),
  };

  console.log();
  printInfo('配置预览:');
  console.log(`    名称:   ${profile.name}`);
  console.log(`    URL:    ${profile.base_url}`);
  console.log(`    Token:  ${maskToken(profile.auth_token)}`);
  console.log(`    模型:   ${profile.model}`);
  console.log();

  const errors = validateProfile(profile);
  if (errors.length > 0) {
    errors.forEach(e => printError(e));
    return;
  }
  if (!validateProfileName(profile.name, config.profiles)) {
    printWarning('配置名称已存在');
    return;
  }

  const ok = await confirm({ message: '确认添加?', default: true });
  if (!ok) {
    printWarning('已取消');
    return;
  }

  addProfile(config, profile);
  printSuccess(`已添加: ${profile.name}`);

  const switchNow = await confirm({ message: '是否立即切换到此方案?', default: true });
  if (switchNow) {
    applyProfile(profile);
    setActiveProfile(config, profile.id);
    saveConfig(config);
    printSuccess(`已切换到: ${profile.name}`);
  }
}
