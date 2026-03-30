import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processTemplateWithDOM } from './template-processor';
import type { ComponentData } from '../../types';

describe('processTemplateWithDOM z-for', () => {
  const mockFindPart = vi.fn((_partId: string) => null);
  const mockRenderComponentToHtml = vi.fn((_c: ComponentData, _p: string) => '');

  const template = '<div z-for="row in {@rows}"><span>{row.label}</span></div>';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expands backend array into multiple elements', () => {
    const component: ComponentData = { id: '1', part_id: 'p1' };
    const backendData = {
      rows: [{ label: 'A' }, { label: 'B' }]
    };
    const result = processTemplateWithDOM(
      template,
      component,
      'page.0',
      mockFindPart,
      mockRenderComponentToHtml,
      false,
      [],
      [],
      [],
      backendData
    );
    expect(result).toContain('A');
    expect(result).toContain('B');
    expect(result).not.toContain('z-for');
  });

  it('concurrent calls do not mix row labels between backendData', async () => {
    const spanInner = (html: string) => {
      const m = html.match(/<span>([^<]*)<\/span>/);
      return m?.[1] ?? '';
    };

    const n = 24;
    const tasks = Array.from({ length: n }, (_, i) => {
      const mark = `ROW_${i}`;
      const component: ComponentData = { id: `c-${i}`, part_id: 'p1' };
      const backendData = { rows: [{ label: mark }] };
      return Promise.resolve(
        processTemplateWithDOM(
          template,
          component,
          'page.0',
          mockFindPart,
          mockRenderComponentToHtml,
          false,
          [],
          [],
          [],
          backendData
        )
      ).then((html) => ({ mark, html }));
    });

    const results = await Promise.all(tasks);
    const seen = new Set<string>();
    for (const { mark, html } of results) {
      expect(spanInner(html)).toBe(mark);
      expect(seen.has(mark)).toBe(false);
      seen.add(mark);
    }
    expect(seen.size).toBe(n);
  });
});
