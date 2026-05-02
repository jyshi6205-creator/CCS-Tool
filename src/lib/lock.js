import fs from 'node:fs';
import path from 'node:path';
import { CONFIG_DIR } from '../constants.js';

const LOCK_TIMEOUT = 5000;
const LOCK_POLL = 100;

/**
 * Get the lock file path for a given resource
 * @param {string} name - resource identifier (e.g. 'config', 'settings')
 * @returns {string} absolute lock file path
 */
function getLockFile(name) {
  return path.join(CONFIG_DIR, `.${name}.lock`);
}

/**
 * Acquire a file lock using exclusive creation for mutual exclusion
 * On timeout, checks for stale locks (verifies the holding process is still alive)
 * @param {string} name - resource identifier
 */
export function acquireLock(name) {
  const lockFile = getLockFile(name);
  const start = Date.now();
  while (true) {
    try {
      const fd = fs.openSync(lockFile, 'wx');
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd);
      return;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      if (Date.now() - start > LOCK_TIMEOUT) {
        // Stale lock detection: force-release if the owning process is dead
        try {
          const pid = fs.readFileSync(lockFile, 'utf-8').trim();
          process.kill(Number(pid), 0);
        } catch {
          fs.unlinkSync(lockFile);
          continue;
        }
        throw new Error('获取文件锁超时');
      }
      // Sync wait before retry (SharedArrayBuffer is required for Atomics.wait)
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, LOCK_POLL);
    }
  }
}

/**
 * Release a file lock
 * @param {string} name - resource identifier
 */
export function releaseLock(name) {
  try {
    fs.unlinkSync(getLockFile(name));
  } catch {}
}
