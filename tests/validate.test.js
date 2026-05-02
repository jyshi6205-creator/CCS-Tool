import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile, validateProfileName } from '../src/lib/validate.js';

describe('validateProfile', () => {
  it('should return no errors for valid profile', () => {
    const profile = {
      name: 'test',
      base_url: 'https://api.anthropic.com',
      auth_token: 'sk-ant-1234',
      model: 'claude-sonnet-4-20250514',
    };
    assert.deepStrictEqual(validateProfile(profile), []);
  });

  it('should reject empty name', () => {
    const errors = validateProfile({ name: '', base_url: 'https://x.com', auth_token: 't', model: 'm' });
    assert.ok(errors.some(e => e.includes('名称')));
  });

  it('should reject invalid URL', () => {
    const errors = validateProfile({ name: 'n', base_url: 'ftp://x.com', auth_token: 't', model: 'm' });
    assert.ok(errors.some(e => e.includes('http')));
  });

  it('should reject empty token', () => {
    const errors = validateProfile({ name: 'n', base_url: 'https://x.com', auth_token: '', model: 'm' });
    assert.ok(errors.some(e => e.includes('Token')));
  });

  it('should reject empty model', () => {
    const errors = validateProfile({ name: 'n', base_url: 'https://x.com', auth_token: 't', model: '' });
    assert.ok(errors.some(e => e.includes('模型')));
  });
});

describe('validateProfileName', () => {
  it('should allow unique name', () => {
    assert.ok(validateProfileName('new', [{ id: '1', name: 'old' }]));
  });

  it('should reject duplicate name', () => {
    assert.ok(!validateProfileName('same', [{ id: '1', name: 'same' }]));
  });

  it('should allow same name for excluded ID', () => {
    assert.ok(validateProfileName('same', [{ id: '1', name: 'same' }], '1'));
  });
});
