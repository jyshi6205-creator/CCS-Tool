import fs from 'node:fs';
import path from 'node:path';
import { select, confirm } from '@inquirer/prompts';
import { BACKUP_DIR } from '../constants.js';
import { backupSettings, listBackups } from '../lib/backup.js';
import { saveClaudeSettings } from '../lib/settings.js';
import { printHeader, printSuccess, printError, printInfo, printWarning } from '../lib/ui.js';

/**
 * Restore ~/.claude/settings.json from a backup
 * List available backups -> select -> confirm -> restore
 */
export async function restoreCommand() {
  printHeader();

  const files = listBackups();
  if (files.length === 0) {
    printWarning('没有备份文件');
    return;
  }

  const choices = files.map(f => {
    const stat = fs.statSync(path.join(BACKUP_DIR, f));
    return {
      name: `${f} (${stat.mtime.toLocaleString()})`,
      value: f,
    };
  });

  const selected = await select({
    message: '选择要恢复的备份:',
    choices,
  });

  const backupPath = path.join(BACKUP_DIR, selected);
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  } catch (err) {
    printError(`备份文件损坏: ${err.message}`);
    return;
  }

  const env = settings.env || {};
  printInfo('将恢复以下配置:');
  console.log(`    Base URL: ${env.ANTHROPIC_BASE_URL || '(未设置)'}`);
  console.log(`    Model:    ${env.ANTHROPIC_MODEL || '(未设置)'}`);
  console.log();

  const ok = await confirm({ message: '确认恢复?', default: false });
  if (!ok) {
    printWarning('已取消');
    return;
  }

  backupSettings();
  saveClaudeSettings(settings);
  printSuccess('已恢复配置');
  printInfo('重启 Claude Code 后生效');
}
