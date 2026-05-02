import chalk from 'chalk';
import { loadConfig, getActiveProfile } from '../lib/config.js';
import { printHeader, printInfo, guardIfEmpty, printNumberedProfile, printCompactProfile } from '../lib/ui.js';

/**
 * List all profiles
 * @param {object} options - command options
 * @param {boolean} options.compact - use compact mode
 */
export async function listCommand(options) {
  printHeader();

  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  const active = getActiveProfile(config);

  if (options.compact) {
    console.log(chalk.gray(`  共 ${config.profiles.length} 个配置方案:\n`));
    console.log(chalk.gray('   # ') + chalk.bold('名称'.padEnd(20)) + chalk.bold('模型'.padEnd(30)) + chalk.bold('地址'));
    console.log(chalk.gray('  ' + '─'.repeat(75)));
    for (let i = 0; i < config.profiles.length; i++) {
      printCompactProfile(i + 1, config.profiles[i], config.profiles[i].id === active?.id);
    }
  } else {
    console.log(chalk.gray(`  共 ${config.profiles.length} 个配置方案:\n`));
    for (let i = 0; i < config.profiles.length; i++) {
      printNumberedProfile(i + 1, config.profiles[i], config.profiles[i].id === active?.id);
    }
  }

  console.log();
  printInfo('切换: ccs check 或 ccs <序号>');
}
