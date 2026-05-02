import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-apply-test-'));
const settingsFile = path.join(tmpDir, 'settings.json');
const backupDir = path.join(tmpDir, 'backups');

process.env.CCS_CONFIG = tmpDir;
process.env.CCS_CLAUDE_SETTINGS = settingsFile;

const { applyProfile, importFromSettings } = await import('../src/lib/apply.js');

const sampleProfile = {
  id: 'p-test1',
  name: 'test',
  base_url: 'https://api.test.com',
  auth_token: 'sk-test-1234',
  model: 'claude-sonnet-4-20250514',
  opus_model: 'claude-opus-4-20250514',
  sonnet_model: undefined,
  haiku_model: undefined,
};

describe('applyProfile', () => {
  beforeEach(() => {
    if (fs.existsSync(settingsFile)) fs.unlinkSync(settingsFile);
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(settingsFile)) fs.unlinkSync(settingsFile);
    if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true });
    const lockFile = path.join(tmpDir, '.settings.lock');
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  });

  it('maps all profile fields to correct env vars', () => {
    const settings = applyProfile(sampleProfile);
    assert.strictEqual(settings.env.ANTHROPIC_BASE_URL, 'https://api.test.com');
    assert.strictEqual(settings.env.ANTHROPIC_AUTH_TOKEN, 'sk-test-1234');
    assert.strictEqual(settings.env.ANTHROPIC_MODEL, 'claude-sonnet-4-20250514');
    assert.strictEqual(settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL, 'claude-opus-4-20250514');
  });

  it('falls back to model for unset sub-model fields', () => {
    const settings = applyProfile(sampleProfile);
    assert.strictEqual(settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL, 'claude-sonnet-4-20250514');
    assert.strictEqual(settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL, 'claude-sonnet-4-20250514');
  });

  it('creates settings.env if missing', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ includeCoAuthoredBy: false }));
    const settings = applyProfile(sampleProfile);
    assert.ok(settings.env);
    assert.strictEqual(settings.env.ANTHROPIC_MODEL, 'claude-sonnet-4-20250514');
  });

  it('preserves existing settings keys', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ includeCoAuthoredBy: false, env: {} }));
    const settings = applyProfile(sampleProfile);
    assert.strictEqual(settings.includeCoAuthoredBy, false);
  });

  it('creates backup before modifying', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ env: { old: true } }));
    applyProfile(sampleProfile);
    assert.ok(fs.existsSync(backupDir));
    const backups = fs.readdirSync(backupDir).filter(f => f.startsWith('settings-'));
    assert.ok(backups.length >= 1);
  });
});

describe('importFromSettings', () => {
  afterEach(() => {
    if (fs.existsSync(settingsFile)) fs.unlinkSync(settingsFile);
  });

  it('extracts all fields from settings.env', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({
      env: {
        ANTHROPIC_BASE_URL: 'https://api.test.com',
        ANTHROPIC_AUTH_TOKEN: 'sk-test',
        ANTHROPIC_MODEL: 'model-1',
        ANTHROPIC_DEFAULT_OPUS_MODEL: 'opus-1',
        ANTHROPIC_DEFAULT_SONNET_MODEL: 'sonnet-1',
        ANTHROPIC_DEFAULT_HAIKU_MODEL: 'haiku-1',
      },
    }));
    const result = importFromSettings();
    assert.strictEqual(result.base_url, 'https://api.test.com');
    assert.strictEqual(result.auth_token, 'sk-test');
    assert.strictEqual(result.model, 'model-1');
    assert.strictEqual(result.opus_model, 'opus-1');
    assert.strictEqual(result.sonnet_model, 'sonnet-1');
    assert.strictEqual(result.haiku_model, 'haiku-1');
  });

  it('returns empty strings when env keys are missing', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ env: {} }));
    const result = importFromSettings();
    assert.strictEqual(result.base_url, '');
    assert.strictEqual(result.auth_token, '');
    assert.strictEqual(result.model, '');
  });

  it('returns empty strings when settings.env is undefined', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({}));
    const result = importFromSettings();
    assert.strictEqual(result.base_url, '');
    assert.strictEqual(result.auth_token, '');
  });
});
