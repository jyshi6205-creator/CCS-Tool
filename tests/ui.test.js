import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

const { maskToken, guardIfEmpty } = await import('../src/lib/ui.js');

describe('maskToken', () => {
  it('returns placeholder for empty string', () => {
    assert.strictEqual(maskToken(''), '(未设置)');
  });

  it('returns placeholder for null', () => {
    assert.strictEqual(maskToken(null), '(未设置)');
  });

  it('returns placeholder for undefined', () => {
    assert.strictEqual(maskToken(undefined), '(未设置)');
  });

  it('masks short tokens (<=8 chars)', () => {
    assert.strictEqual(maskToken('12345678'), '****');
    assert.strictEqual(maskToken('abc'), '****');
  });

  it('masks normal tokens with first4+last4', () => {
    assert.strictEqual(maskToken('sk-ant-12345678'), 'sk-a****5678');
  });

  it('masks long tokens correctly', () => {
    const token = 'sk-ant-apikey-very-long-token-here';
    assert.strictEqual(maskToken(token), 'sk-a****here');
  });
});

describe('guardIfEmpty', () => {
  it('returns true when profiles is empty', () => {
    const config = { profiles: [] };
    assert.strictEqual(guardIfEmpty(config), true);
  });

  it('returns false when profiles has entries', () => {
    const config = { profiles: [{ id: '1', name: 'test' }] };
    assert.strictEqual(guardIfEmpty(config), false);
  });
});
