import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-settings-test-'));
const settingsFile = path.join(tmpDir, 'settings.json');

process.env.CCS_CONFIG = tmpDir;
process.env.CCS_CLAUDE_SETTINGS = settingsFile;

const { loadClaudeSettings, saveClaudeSettings } = await import('../src/lib/settings.js');

describe('loadClaudeSettings', () => {
  afterEach(() => {
    if (fs.existsSync(settingsFile)) fs.unlinkSync(settingsFile);
  });

  it('returns empty object when file does not exist', () => {
    const result = loadClaudeSettings();
    assert.deepStrictEqual(result, {});
  });

  it('returns empty object when file has invalid JSON', () => {
    fs.writeFileSync(settingsFile, 'not valid json{{{');
    const result = loadClaudeSettings();
    assert.deepStrictEqual(result, {});
  });

  it('parses valid JSON settings', () => {
    const data = { env: { ANTHROPIC_MODEL: 'test' } };
    fs.writeFileSync(settingsFile, JSON.stringify(data));
    const result = loadClaudeSettings();
    assert.deepStrictEqual(result, data);
  });
});

describe('saveClaudeSettings', () => {
  afterEach(() => {
    if (fs.existsSync(settingsFile)) fs.unlinkSync(settingsFile);
    // 清理可能残留的锁文件
    const lockFile = path.join(tmpDir, '.settings.lock');
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  });

  it('writes formatted JSON with 2-space indent', () => {
    const data = { env: { ANTHROPIC_MODEL: 'test' } };
    saveClaudeSettings(data);
    const raw = fs.readFileSync(settingsFile, 'utf-8');
    assert.strictEqual(raw, JSON.stringify(data, null, 2));
  });

  it('overwrites existing content', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ old: true }));
    const newData = { env: { ANTHROPIC_MODEL: 'new' } };
    saveClaudeSettings(newData);
    const result = loadClaudeSettings();
    assert.deepStrictEqual(result, newData);
    assert.strictEqual(result.old, undefined);
  });
});
