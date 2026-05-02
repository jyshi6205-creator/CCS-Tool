import fs from 'node:fs';
import { loadConfig } from '../lib/config.js';
import { printHeader, printSuccess, guardIfEmpty } from '../lib/ui.js';

/**
 * Export all profiles to a JSON file
 * API keys are redacted by default; pass --include-secrets to include them
 * @param {object} options - command options
 * @param {string} options.output - output file path
 * @param {boolean} options.includeSecrets - include API keys
 */
export async function exportCommand(options) {
  printHeader();
  const config = loadConfig();
  if (guardIfEmpty(config)) return;

  const exportData = {
    version: 1,
    exported_at: new Date().toISOString(),
    profiles: config.profiles.map(p => {
      const exported = { ...p };
      if (!options.includeSecrets) {
        exported.auth_token = '***REDACTED***';
      }
      return exported;
    }),
  };

  const json = JSON.stringify(exportData, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, json, 'utf-8');
    printSuccess(`已导出 ${config.profiles.length} 个配置到 ${options.output}`);
  } else {
    process.stdout.write(json + '\n');
  }
}
