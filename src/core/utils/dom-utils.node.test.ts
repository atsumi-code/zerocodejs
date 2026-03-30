/** @vitest-environment node */

import { describe, it, expect } from 'vitest';
import { getDOMParser } from './dom-utils';

describe('getDOMParser (Node)', () => {
  it('returns a DOMParser constructor that can parse HTML', () => {
    const Parser = getDOMParser();
    const parser = new Parser();
    const parsed = parser.parseFromString('<div id="x">ok</div>', 'text/html');
    expect(parsed.getElementById('x')?.textContent).toBe('ok');
  });

  it('returns the same constructor on repeated calls', () => {
    const a = getDOMParser();
    const b = getDOMParser();
    expect(a).toBe(b);
  });
});
