import chalk from 'chalk';
import { ANTHROPIC_API_VERSION } from '../constants.js';
import { loadConfig, getActiveProfile, findProfile } from '../lib/config.js';
import { printHeader, printSuccess, printError, printInfo, printWarning, guardIfEmpty } from '../lib/ui.js';

/**
 * Test API connectivity for a profile
 * Sends a max_tokens=1 request to the /v1/messages endpoint
 * @param {string|undefined} profileArg - profile name or ID (default: active)
 */
export async function testCommand(profileArg) {
  printHeader();
  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  let profile;
  if (profileArg) {
    profile = findProfile(config, profileArg);
    if (!profile) {
      printError(`未找到配置: ${profileArg}`);
      return;
    }
  } else {
    profile = getActiveProfile(config);
    if (!profile) {
      printError('没有激活的配置');
      return;
    }
    printInfo(`测试当前激活配置: ${profile.name}`);
  }

  console.log();
  printInfo(`配置: ${profile.name}`);
  printInfo(`端点: ${profile.base_url}`);
  printInfo(`模型: ${profile.model}`);
  console.log();

  const url = profile.base_url.replace(/\/+$/, '') + '/v1/messages';
  printInfo(`正在测试 ${url} ...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': profile.auth_token,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: profile.model,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      printSuccess('连接成功！API 响应正常');
    } else if (res.status === 401) {
      printError('认证失败: API Key 无效或已过期');
    } else if (res.status === 403) {
      printError('权限不足: API Key 没有访问权限');
    } else if (res.status === 429) {
      printWarning('请求被限流（Rate Limited），但连接正常');
    } else {
      printWarning(`API 返回状态码 ${res.status}`);
      try {
        const body = await res.text();
        console.log(chalk.gray('    ' + body.slice(0, 200)));
      } catch {}
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      printError('连接超时（10秒）');
    } else {
      printError(`连接失败: ${err.message}`);
    }
  }
}
