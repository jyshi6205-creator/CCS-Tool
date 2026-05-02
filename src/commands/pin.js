import { loadConfig, getActiveProfile, findProfile, saveConfig } from '../lib/config.js';
import { bindProject, unbindProject, listBindings, getCwd } from '../lib/project.js';
import { printHeader, printSuccess, printError, printInfo, printWarning, guardIfEmpty } from '../lib/ui.js';

/**
 * Bind the current directory to a profile
 * @param {string|undefined} profileArg - profile name or ID (default: active)
 */
export async function pinCommand(profileArg) {
  printHeader();
  const config = loadConfig();

  let profile;
  if (!profileArg) {
    profile = getActiveProfile(config);
    if (!profile) {
      printError('没有激活的配置方案，请指定档案名称');
      return;
    }
  } else {
    profile = findProfile(config, profileArg);
    if (!profile) {
      printError(`未找到配置: ${profileArg}`);
      return;
    }
  }

  const cwd = getCwd();
  bindProject(config, cwd, profile.id, profile.name);
  saveConfig(config);
  printSuccess(`已绑定: ${cwd} → ${profile.name}`);
  printInfo('进入此目录时将自动切换到该配置');
}

/**
 * Unbind the current directory
 */
export async function unpinCommand() {
  printHeader();
  const config = loadConfig();
  const cwd = getCwd();

  if (!config.projectBindings?.[cwd]) {
    printWarning('当前目录没有绑定配置');
    return;
  }

  unbindProject(config, cwd);
  saveConfig(config);
  printSuccess(`已解除绑定: ${cwd}`);
}

/**
 * List all project bindings
 */
export async function pinsCommand() {
  printHeader();
  const config = loadConfig();
  const bindings = listBindings(config);

  if (bindings.length === 0) {
    printWarning('没有项目绑定');
    printInfo('运行 ccs pin 将当前目录绑定到配置');
    return;
  }

  console.log();
  printInfo(`共 ${bindings.length} 个项目绑定:\n`);
  for (const b of bindings) {
    const isCurrent = b.path === getCwd();
    const marker = isCurrent ? '●' : '○';
    console.log(`    ${marker} ${b.profileName}`);
    console.log(`      ${b.path}`);
    console.log();
  }
}
