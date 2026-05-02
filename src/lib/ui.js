import chalk from 'chalk';

/**
 * Calculate terminal display width (CJK chars = 2 columns, ASCII = 1)
 * @param {string} str
 * @returns {number} display width
 */
function displayWidth(str) {
  let width = 0;
  for (const ch of str) {
    width += ch.charCodeAt(0) > 0x7f ? 2 : 1;
  }
  return width;
}

/**
 * Right-pad with spaces to a target display width
 * @param {string} str - original string
 * @param {number} targetWidth - target display width
 * @returns {string} padded string
 */
function padEnd(str, targetWidth) {
  return str + ' '.repeat(Math.max(0, targetWidth - displayWidth(str)));
}

/**
 * Truncate string to a max display width, appending '..' on overflow
 * @param {string} str - original string
 * @param {number} maxWidth - max display width
 * @returns {string} truncated string
 */
function truncate(str, maxWidth) {
  if (displayWidth(str) <= maxWidth) return str;
  let width = 0;
  let result = '';
  for (const ch of str) {
    const w = ch.charCodeAt(0) > 0x7f ? 2 : 1;
    if (width + w > maxWidth - 2) break;
    result += ch;
    width += w;
  }
  return result + '..';
}

/**
 * Mask an API token, keeping only the first 4 and last 4 characters
 * @param {string} token - raw token
 * @returns {string} masked string
 */
export function maskToken(token) {
  if (!token) return '(未设置)';
  if (token.length <= 8) return '****';
  return token.slice(0, 4) + '****' + token.slice(-4);
}

/** Print the tool header banner */
export function printHeader() {
  console.log();
  console.log(chalk.cyan('  ┌───────────────────────────────────┐'));
  console.log(chalk.cyan('  │') + chalk.bold.white('    CCS-Tool  ·  模型配置切换工具   ') + chalk.cyan('│'));
  console.log(chalk.cyan('  └───────────────────────────────────┘'));
  console.log();
}

/**
 * Print a numbered profile entry (detailed mode)
 * @param {number} index - number (1-based)
 * @param {object} profile - profile object
 * @param {boolean} isActive - whether this is the active profile
 */
export function printNumberedProfile(index, profile, isActive = false) {
  const idx = chalk.gray(String(index).padStart(2));
  const dot = isActive ? chalk.green('●') : chalk.gray('○');
  const name = chalk.bold(padEnd(truncate(profile.name, 18), 18));
  const model = chalk.gray(padEnd(truncate(profile.model, 28), 28));
  const url = chalk.gray(profile.base_url);
  console.log(`    ${idx} ${dot} ${name} ${model} ${url}`);
}

/**
 * Print a numbered profile entry (compact single-line mode)
 * @param {number} index - number (1-based)
 * @param {object} profile - profile object
 * @param {boolean} isActive - whether this is the active profile
 */
export function printCompactProfile(index, profile, isActive = false) {
  const marker = isActive ? chalk.green('●') : chalk.gray('○');
  const idx = chalk.gray(String(index).padStart(2));
  const name = padEnd(truncate(profile.name, 18), 18);
  const model = padEnd(truncate(profile.model, 28), 28);
  console.log(`  ${idx} ${marker} ${name}${model}${chalk.gray(profile.base_url)}`);
}

/** Print a success message */
export function printSuccess(msg) {
  console.log(chalk.green('  ✓ ') + msg);
}

/** Print an error message */
export function printError(msg) {
  console.log(chalk.red('  ✗ ') + msg);
}

/** Print an info message */
export function printInfo(msg) {
  console.log(chalk.blue('  ℹ ') + msg);
}

/** Print a warning message */
export function printWarning(msg) {
  console.log(chalk.yellow('  ⚠ ') + msg);
}

/**
 * Check if config is empty and print a hint if so
 * @param {object} config - config object
 * @returns {boolean} whether the config is empty
 */
export function guardIfEmpty(config) {
  if (config.profiles.length === 0) {
    printWarning('还没有配置方案');
    printInfo('运行 ccs add 添加一个配置方案');
    return true;
  }
  return false;
}
