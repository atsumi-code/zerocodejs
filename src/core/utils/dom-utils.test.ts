import { describe, it, expect } from 'vitest';
import { getDOMParser } from './dom-utils';

describe('getDOMParser', () => {
  it('returns global DOMParser when available (no window-only gate)', () => {
    expect(typeof DOMParser).toBe('function');
    expect(getDOMParser()).toBe(DOMParser);
  });
});
