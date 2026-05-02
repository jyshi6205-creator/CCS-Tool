import fs from 'node:fs';
import { confirm } from '@inquirer/prompts';
import { loadConfig, addProfile, generateId } from '../lib/config.js';
import { validateProfile, validateProfileName } from '../lib/validate.js';
import { printHeader, printSuccess, printError, printInfo, printWarning } from '../lib/ui.js';

/**
 * Import profiles from a JSON file
 * Skips redacted tokens and invalid profiles; handles name conflicts
 * @param {string} filePath - import file path
 * @param {object} options - command options
 * @param {boolean} options.replace - replace all existing profiles
 */
export async function importCommand(filePath, options) {
  printHeader();

  if (!filePath) {
    printError('请指定导入文件路径');
    printInfo('用法: ccs import <file.json>');
    return;
  }

  if (!fs.existsSync(filePath)) {
    printError(`文件不存在: ${filePath}`);
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    printError(`文件解析失败: ${err.message}`);
    return;
  }

  if (!data.profiles || !Array.isArray(data.profiles)) {
    printError('无效的导入文件格式');
    return;
  }

  const config = loadConfig();

  if (options.replace) {
    const ok = await confirm({
      message: `将替换所有现有配置（当前 ${config.profiles.length} 个），确认？`,
      default: false,
    });
    if (!ok) {
      printWarning('已取消');
      return;
    }
    config.profiles = [];
    config.active = null;
  }

  let imported = 0, skipped = 0;
  for (const p of data.profiles) {
    if (p.auth_token === '***REDACTED***') {
      printWarning(`跳过 "${p.name}": Token 已脱敏，请手动编辑`);
      skipped++;
      continue;
    }

    const errors = validateProfile(p);
    if (errors.length > 0) {
      printWarning(`跳过 "${p.name}": ${errors.join(', ')}`);
      skipped++;
      continue;
    }

    const newName = validateProfileName(p.name, config.profiles)
      ? p.name
      : `${p.name}-imported`;

    const profile = { ...p, id: generateId(), name: newName };
    addProfile(config, profile);
    imported++;
  }

  printSuccess(`导入完成: ${imported} 个成功, ${skipped} 个跳过`);
}
