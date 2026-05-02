import { confirm, input } from '@inquirer/prompts';
import { loadConfig, addProfile, setActiveProfile, saveConfig, generateId } from '../lib/config.js';
import { importFromSettings, applyProfile } from '../lib/apply.js';
import { printHeader, printSuccess, printInfo, printWarning, maskToken } from '../lib/ui.js';
import { addProfileFlow } from '../lib/profile-flow.js';

/**
 * First-time initialization flow
 * Detect existing ~/.claude/settings.json config and import, or guide creation
 */
export async function initCommand() {
  printHeader();

  const config = loadConfig();

  if (config.profiles.length > 0) {
    printWarning('已有配置方案存在');
    const proceed = await confirm({
      message: '是否重新初始化？这不会删除现有配置',
      default: false,
    });
    if (!proceed) return;
  }

  const existing = importFromSettings();

  if (existing.base_url && existing.auth_token && existing.model) {
    printInfo('检测到现有 Claude Code 配置:');
    console.log(`    Base URL: ${existing.base_url}`);
    console.log(`    Model:    ${existing.model}`);
    console.log(`    Token:    ${maskToken(existing.auth_token)}`);
    console.log();

    const importIt = await confirm({
      message: '是否将现有配置导入为第一个方案？',
      default: true,
    });

    if (importIt) {
      const name = await input({
        message: '为此配置起个名字:',
        default: '当前配置',
      });

      const profile = {
        id: generateId(),
        name,
        ...existing,
        created_at: new Date().toISOString(),
      };

      addProfile(config, profile);
      applyProfile(profile);
      setActiveProfile(config, profile.id);
      saveConfig(config);
      printSuccess(`已导入配置: ${name}`);
      return;
    }
  }

  printInfo('开始创建新配置方案');
  await addProfileFlow(config);
}
