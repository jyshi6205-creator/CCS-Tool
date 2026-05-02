import { select, confirm } from '@inquirer/prompts';
import { loadConfig, getActiveProfile, removeProfile, setActiveProfile, saveConfig } from '../lib/config.js';
import { applyProfile } from '../lib/apply.js';
import { printHeader, printSuccess, printWarning, printInfo, guardIfEmpty } from '../lib/ui.js';

/**
 * Delete a profile
 * If deleting the active profile, auto-switch to another one
 */
export async function removeCommand() {
  printHeader();

  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  const active = getActiveProfile(config);

  const choices = config.profiles.map(p => ({
    name: `${p.name}${p.id === active?.id ? ' (当前激活)' : ''}`,
    value: p.id,
    description: p.model,
  }));

  const selected = await select({
    message: '选择要删除的配置:',
    choices,
  });

  const profile = config.profiles.find(p => p.id === selected);
  if (!profile) return;

  if (profile.id === active?.id) {
    printWarning('这是当前激活的配置方案');
    const force = await confirm({
      message: '确定要删除吗？删除后将自动切换到其他方案',
      default: false,
    });
    if (!force) {
      printInfo('已取消');
      return;
    }
  } else {
    const ok = await confirm({
      message: `确定删除 "${profile.name}" ?`,
      default: false,
    });
    if (!ok) {
      printInfo('已取消');
      return;
    }
  }

  removeProfile(config, selected);
  printSuccess(`已删除: ${profile.name}`);

  if (profile.id === active?.id) {
    const newActive = getActiveProfile(config);
    if (newActive) {
      applyProfile(newActive);
      setActiveProfile(config, newActive.id);
      saveConfig(config);
      printInfo(`已自动切换到: ${newActive.name}`);
    }
  }
}
