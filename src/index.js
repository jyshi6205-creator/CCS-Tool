import { Command } from 'commander';
import { VERSION } from './constants.js';
import { checkCommand } from './commands/check.js';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { currentCommand } from './commands/current.js';
import { editCommand } from './commands/edit.js';
import { removeCommand } from './commands/remove.js';
import { cloneCommand } from './commands/clone.js';
import { exportCommand } from './commands/export.js';
import { importCommand } from './commands/import.js';
import { testCommand } from './commands/test.js';
import { restoreCommand } from './commands/restore.js';
import { pinCommand, unpinCommand, pinsCommand } from './commands/pin.js';
import { autoCommand } from './commands/auto.js';
import { hookCommand } from './commands/hook.js';

const program = new Command();

program
  .name('ccs')
  .description('Claude Code 模型配置切换工具')
  .version(VERSION)
  .allowExcessArguments(true);

// ccs <number> — parse numeric arg and route to checkCommand
program.argument('[args...]');
program.action((args) => {
  if (args.length === 1 && /^\d+$/.test(args[0])) {
    checkCommand(args[0]);
  } else {
    program.help();
  }
});

program
  .command('init')
  .description('首次初始化，导入或创建配置')
  .action(initCommand);

program
  .command('add')
  .description('添加新的配置方案')
  .action(addCommand);

program
  .command('check')
  .description('切换配置方案（交互式、按名称/ID 或序号）')
  .argument('[profile]', '配置名称、ID 或序号')
  .action(checkCommand);

program
  .command('list')
  .alias('ls')
  .description('列出所有配置方案')
  .option('-c, --compact', '紧凑模式')
  .action(listCommand);

program
  .command('current')
  .alias('cur')
  .description('查看当前激活的配置')
  .action(currentCommand);

program
  .command('edit')
  .description('编辑配置方案')
  .argument('[profile]', '配置名称或ID（可选）')
  .option('-f, --field <field>', '直接编辑指定字段')
  .action(editCommand);

program
  .command('remove')
  .alias('rm')
  .description('删除配置方案')
  .action(removeCommand);

program
  .command('clone')
  .description('克隆配置方案')
  .argument('[profile]', '要克隆的配置名称或ID')
  .action(cloneCommand);

program
  .command('export')
  .description('导出配置方案')
  .option('-o, --output <file>', '输出到文件')
  .option('--include-secrets', '包含 API Key（默认脱敏）')
  .action(exportCommand);

program
  .command('import')
  .description('导入配置方案')
  .argument('<file>', '导入文件路径')
  .option('--replace', '替换所有现有配置')
  .action(importCommand);

program
  .command('test')
  .description('测试配置连接')
  .argument('[profile]', '配置名称或ID（默认当前激活）')
  .action(testCommand);

program
  .command('restore')
  .description('从备份恢复配置')
  .action(restoreCommand);

program
  .command('pin')
  .description('将当前目录绑定到配置档案')
  .argument('[profile]', '配置名称或ID（默认当前激活）')
  .action(pinCommand);

program
  .command('unpin')
  .description('解除当前目录的配置绑定')
  .action(unpinCommand);

program
  .command('pins')
  .description('列出所有项目绑定')
  .action(pinsCommand);

program
  .command('auto')
  .description('根据当前目录自动切换配置')
  .option('-q, --quiet', '静默模式')
  .action(autoCommand);

program
  .command('hook')
  .description('输出 Shell Hook 代码（用于 eval "$(ccs hook)"）')
  .action(hookCommand);

/**
 * Start the CLI program
 * @param {string[]} argv - command line arguments (typically process.argv)
 */
export function run(argv) {
  program.parse(argv);
}
