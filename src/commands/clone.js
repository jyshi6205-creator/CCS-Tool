import { select, input, confirm } from '@inquirer/prompts';
import { loadConfig, findProfile, addProfile, generateId } from '../lib/config.js';
import { printHeader, printSuccess, printError, printWarning, guardIfEmpty } from '../lib/ui.js';

/**
 * Clone an existing profile
 * Copy all fields from a source profile, assign new ID and name
 * @param {string|undefined} sourceArg - name or ID of source profile to clone
 */
export async function cloneCommand(sourceArg) {
  printHeader();
  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  let source;
  if (sourceArg) {
    source = findProfile(config, sourceArg);
    if (!source) {
      printError(`未找到配置: ${sourceArg}`);
      return;
    }
  } else {
    const choices = config.profiles.map(p => ({
      name: `${p.name} (${p.model})`,
      value: p.id,
    }));
    const selected = await select({ message: '选择要克隆的配置:', choices });
    source = config.profiles.find(p => p.id === selected);
    if (!source) return;
  }

  const newName = await input({
    message: '新配置名称:',
    default: `${source.name}-copy`,
    validate: v => v.trim() ? true : '名称不能为空',
  });

  const profile = {
    ...source,
    id: generateId(),
    name: newName.trim(),
    created_at: new Date().toISOString(),
  };

  const ok = await confirm({ message: `确认克隆 "${source.name}" → "${profile.name}"?`, default: true });
  if (!ok) {
    printWarning('已取消');
    return;
  }

  addProfile(config, profile);
  printSuccess(`已克隆: ${source.name} → ${profile.name}`);
}
