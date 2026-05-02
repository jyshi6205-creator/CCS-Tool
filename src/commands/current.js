import chalk from 'chalk';
import { loadConfig, getActiveProfile } from '../lib/config.js';
import { printHeader, printWarning, printInfo, maskToken } from '../lib/ui.js';

/**
 * Show details of the currently active profile
 */
export async function currentCommand() {
  printHeader();

  const config = loadConfig();
  const active = getActiveProfile(config);

  if (!active) {
    printWarning('当前没有激活的配置方案');
    printInfo('运行 ccs check 切换配置');
    return;
  }

  console.log(`    ${chalk.green('●')} ${chalk.bold(active.name)}`);
  console.log();
  console.log(`      模型     ${active.model}`);
  console.log(`      地址     ${active.base_url}`);
  console.log(`      API Key  ${maskToken(active.auth_token)}`);
  if (active.opus_model && active.opus_model !== active.model) {
    console.log(`      Opus     ${active.opus_model}`);
  }
  if (active.sonnet_model && active.sonnet_model !== active.model) {
    console.log(`      Sonnet   ${active.sonnet_model}`);
  }
  if (active.haiku_model && active.haiku_model !== active.model) {
    console.log(`      Haiku    ${active.haiku_model}`);
  }
  console.log();
}
