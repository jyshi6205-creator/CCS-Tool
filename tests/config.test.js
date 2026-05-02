import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// 设置临时配置目录
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-test-'));
process.env.CCS_CONFIG = tmpDir;

// 动态导入以使用环境变量
const { loadConfig, saveConfig, addProfile, removeProfile, updateProfile, generateId, getActiveProfile, setActiveProfile } = await import('../src/lib/config.js');

describe('config operations', () => {
  beforeEach(() => {
    // 重置配置文件
    const configFile = path.join(tmpDir, 'config.json');
    if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
  });

  afterEach(() => {
    // 清理
    const configFile = path.join(tmpDir, 'config.json');
    if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
  });

  it('loadConfig returns empty config when no file exists', () => {
    const config = loadConfig();
    assert.deepStrictEqual(config.profiles, []);
    assert.strictEqual(config.active, null);
  });

  it('addProfile and loadConfig round-trip', () => {
    const config = loadConfig();
    const profile = { id: generateId(), name: 'test', base_url: 'https://x.com', auth_token: 't', model: 'm' };
    addProfile(config, profile);
    const loaded = loadConfig();
    assert.strictEqual(loaded.profiles.length, 1);
    assert.strictEqual(loaded.profiles[0].name, 'test');
  });

  it('removeProfile updates active when removing active profile', () => {
    const config = loadConfig();
    const p1 = { id: generateId(), name: 'a', base_url: 'https://x.com', auth_token: 't', model: 'm' };
    const p2 = { id: generateId(), name: 'b', base_url: 'https://x.com', auth_token: 't', model: 'm' };
    addProfile(config, p1);
    addProfile(config, p2);
    setActiveProfile(config, p1.id);
    removeProfile(config, p1.id);
    const loaded = loadConfig();
    assert.strictEqual(loaded.profiles.length, 1);
    assert.strictEqual(loaded.active, p2.id);
  });

  it('updateProfile merges updates', () => {
    const config = loadConfig();
    const profile = { id: generateId(), name: 'test', base_url: 'https://x.com', auth_token: 't', model: 'm' };
    addProfile(config, profile);
    updateProfile(config, profile.id, { model: 'new-model' });
    const loaded = loadConfig();
    assert.strictEqual(loaded.profiles[0].model, 'new-model');
    assert.strictEqual(loaded.profiles[0].name, 'test'); // 未修改
  });

  it('setActiveProfile and getActiveProfile', () => {
    const config = loadConfig();
    const profile = { id: generateId(), name: 'test', base_url: 'https://x.com', auth_token: 't', model: 'm' };
    addProfile(config, profile);
    setActiveProfile(config, profile.id);
    const active = getActiveProfile(config);
    assert.strictEqual(active?.id, profile.id);
  });

  it('generateId creates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.notStrictEqual(id1, id2);
    assert.ok(id1.startsWith('p-'));
  });
});
