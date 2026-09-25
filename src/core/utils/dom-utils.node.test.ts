/** @vitest-environment node */

import { describe, it, expect } from 'vitest';
import { getDOMParser } from './dom-utils';
import { renderToHtml } from '../renderer/renderer';
import type { ZeroCodeData } from '../../types';

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

describe('renderToHtml (Node, no global window)', () => {
  it('sanitizes rich text and URL attributes using the jsdom window', () => {
    expect((globalThis as { window?: unknown }).window).toBeUndefined();
    const data: ZeroCodeData = {
      page: [
        {
          id: 'c1',
          part_id: 'p1',
          body: '<p><strong>本文</strong><img src=x onerror=alert(1)></p>',
          s: 'javascript',
          r: 'alert(1)'
        }
      ],
      css: {},
      parts: {
        common: [
          {
            id: 't1',
            type: 't',
            description: '',
            parts: [
              {
                id: 'p1',
                title: '',
                description: '',
                body: '<div><a href="{$s:https}:{$r:x}">x</a>{$body:x:rich}</div>'
              }
            ]
          }
        ],
        individual: [],
        special: []
      },
      images: { common: [], individual: [], special: [] }
    };
    expect(renderToHtml(data)).toBe('<div><a href="">x</a><p><strong>本文</strong></p></div>');
  });
});
