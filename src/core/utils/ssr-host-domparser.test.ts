import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ZeroCodeData } from '../../types';

vi.mock('jsdom', () => {
  const JSDOM = vi.fn(() => {
    throw new Error('JSDOM must not be constructed when host provides DOMParser');
  });
  return { JSDOM, default: { JSDOM } };
});

import { JSDOM } from 'jsdom';
import { getDOMParser } from './dom-utils';
import { renderToHtml } from '../renderer/renderer';

describe('SSR: host DOMParser (jsdom must not load)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDOMParser uses global DOMParser and never calls JSDOM', () => {
    expect(typeof DOMParser).toBe('function');
    expect(getDOMParser()).toBe(DOMParser);
    expect(JSDOM).not.toHaveBeenCalled();
  });

  it('renderToHtml with z-for runs without constructing JSDOM', () => {
    const data: ZeroCodeData = {
      page: [{ id: 'c1', part_id: 'part-zfor', title: 'x' }],
      css: {},
      parts: {
        common: [
          {
            id: 'type-1',
            type: 't',
            description: '',
            parts: [
              {
                id: 'part-zfor',
                title: 'ZFor',
                description: '',
                body: '<div z-for="row in {@rows}"><span>{row.label}</span></div>'
              }
            ]
          }
        ],
        individual: [],
        special: []
      },
      images: { common: [], individual: [], special: [] },
      backendData: {
        rows: [{ label: 'HOST_DOM_ONLY' }]
      }
    };

    const html = renderToHtml(data, { enableEditorAttributes: false });
    expect(html).toContain('HOST_DOM_ONLY');
    expect(JSDOM).not.toHaveBeenCalled();
  });
});
