import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-backup-test-'));
const backupDir = path.join(tmpDir, 'backups');
const settingsFile = path.join(tmpDir, 'settings.json');

process.env.CCS_CONFIG = tmpDir;
process.env.CCS_CLAUDE_SETTINGS = settingsFile;

const { listBackups, backupSettings } = await import('../src/lib/backup.js');

describe('listBackups', () => {
  afterEach(() => {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true });
    }
  });

  it('returns empty array when backup dir does not exist', () => {
    const result = listBackups();
    assert.deepStrictEqual(result, []);
  });

  it('returns empty array when dir is empty', () => {
    fs.mkdirSync(backupDir, { recursive: true });
    const result = listBackups();
    assert.deepStrictEqual(result, []);
  });

  it('filters only settings-*.json files', () => {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, 'settings-2026-01-01.json'), '{}');
    fs.writeFileSync(path.join(backupDir, 'other-file.json'), '{}');
    fs.writeFileSync(path.join(backupDir, 'settings-2026-01-02.json'), '{}');
    const result = listBackups();
    assert.strictEqual(result.length, 2);
    assert.ok(result.every(f => f.startsWith('settings-')));
  });

  it('returns sorted descending (newest first)', () => {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, 'settings-2026-01-01T00-00-00.json'), '{}');
    fs.writeFileSync(path.join(backupDir, 'settings-2026-01-03T00-00-00.json'), '{}');
    fs.writeFileSync(path.join(backupDir, 'settings-2026-01-02T00-00-00.json'), '{}');
    const result = listBackups();
    assert.strictEqual(result[0], 'settings-2026-01-03T00-00-00.json');
    assert.strictEqual(result[2], 'settings-2026-01-01T00-00-00.json');
  });
});

describe('backupSettings', () => {
  afterEach(() => {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true });
    }
    if (fs.existsSync(settingsFile)) {
      fs.unlinkSync(settingsFile);
    }
  });

  it('no-op when settings file does not exist', () => {
    backupSettings();
    assert.ok(!fs.existsSync(backupDir));
  });

  it('creates backup of settings file', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ env: {} }));
    backupSettings();
    assert.ok(fs.existsSync(backupDir));
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('settings-'));
    assert.strictEqual(files.length, 1);
  });

  it('creates backup dir if missing', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ env: {} }));
    assert.ok(!fs.existsSync(backupDir));
    backupSettings();
    assert.ok(fs.existsSync(backupDir));
  });

  it('rotates old backups when count exceeds limit', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ env: {} }));
    fs.mkdirSync(backupDir, { recursive: true });

    for (let i = 0; i < 12; i++) {
      const name = `settings-2026-01-${String(i + 1).padStart(2, '0')}T00-00-00.json`;
      fs.writeFileSync(path.join(backupDir, name), '{}');
    }

    backupSettings();

    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('settings-'));
    assert.ok(files.length <= 11);
  });
});
