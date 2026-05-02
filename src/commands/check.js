import { select } from '@inquirer/prompts';
import { loadConfig, getActiveProfile, findProfile, setActiveProfile, saveConfig } from '../lib/config.js';
import { applyProfile } from '../lib/apply.js';
import { bindProject, getCwd } from '../lib/project.js';
import { printHeader, printSuccess, printError, printInfo, guardIfEmpty, printNumberedProfile } from '../lib/ui.js';

/**
 * Execute the switch: apply profile, update active, bind project, persist
 * @param {object} config - config object
 * @param {object} profile - target profile
 */
function doSwitch(config, profile) {
  applyProfile(profile);
  setActiveProfile(config, profile.id);
  bindProject(config, getCwd(), profile.id, profile.name);
  saveConfig(config);
}

/**
 * Switch profile
 * Supports three modes: by index, by name/ID, or interactive selection
 * @param {string|undefined} profileArg - profile name, ID, or index number
 */
export async function checkCommand(profileArg) {
  printHeader();

  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  // Lookup by index
  if (profileArg && /^\d+$/.test(profileArg)) {
    const index = parseInt(profileArg, 10) - 1;
    if (index < 0 || index >= config.profiles.length) {
      printError(`序号 ${profileArg} 超出范围（共 ${config.profiles.length} 个配置）`);
      return;
    }
    const profile = config.profiles[index];
    doSwitch(config, profile);
    console.log();
    printSuccess(`已切换到: ${profile.name}`);
    printNumberedProfile(index + 1, profile, true);
    console.log();
    printInfo('重启 Claude Code 后生效');
    return;
  }

  // Lookup by name or ID
  if (profileArg) {
    const profile = findProfile(config, profileArg);
    if (!profile) {
      printError(`未找到配置: ${profileArg}`);
      printInfo('运行 ccs list 查看所有配置');
      return;
    }
    doSwitch(config, profile);
    console.log();
    printSuccess(`已切换到: ${profile.name}`);
    console.log();
    printInfo('重启 Claude Code 后生效');
    return;
  }

  // Interactive mode
  const active = getActiveProfile(config);
  const choices = config.profiles.map((p, i) => ({
    name: `${String(i + 1).padStart(2)}. ${p.name}  ${p.model}`,
    value: i,
    description: p.base_url,
  }));

  const selected = await select({
    message: '选择配置方案:',
    choices,
    default: active ? config.profiles.findIndex(p => p.id === active.id) : 0,
  });

  const profile = config.profiles[selected];
  if (!profile) return;

  doSwitch(config, profile);
  console.log();
  printSuccess(`已切换到: ${profile.name}`);
  console.log();
  printInfo('重启 Claude Code 后生效');
}
