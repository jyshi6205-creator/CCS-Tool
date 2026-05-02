import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ccs-lock-test-'));
process.env.CCS_CONFIG = tmpDir;

const { acquireLock, releaseLock } = await import('../src/lib/lock.js');

const lockFile = path.join(tmpDir, '.test.lock');

describe('lock operations', () => {
  afterEach(() => {
    try { fs.unlinkSync(lockFile); } catch {}
  });

  it('acquireLock creates lock file with PID', () => {
    acquireLock('test');
    assert.ok(fs.existsSync(lockFile));
    const content = fs.readFileSync(lockFile, 'utf-8');
    assert.strictEqual(content, String(process.pid));
    releaseLock('test');
  });

  it('releaseLock removes lock file', () => {
    acquireLock('test');
    assert.ok(fs.existsSync(lockFile));
    releaseLock('test');
    assert.ok(!fs.existsSync(lockFile));
  });

  it('releaseLock does not throw when lock file missing', () => {
    assert.doesNotThrow(() => releaseLock('nonexistent'));
  });

  it('acquireLock detects stale lock and recovers', () => {
    // Write a lock file with a non-existent PID
    fs.writeFileSync(lockFile, '999999999');
    // Should detect stale lock and acquire successfully
    acquireLock('test');
    assert.ok(fs.existsSync(lockFile));
    assert.strictEqual(fs.readFileSync(lockFile, 'utf-8'), String(process.pid));
    releaseLock('test');
  });
});
