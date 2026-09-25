import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { MONACO_VERSION, MONACO_VS_PATH } from './monaco-cdn';

describe('Monaco の CDN バージョン', () => {
  it('npm の monaco-editor と同じ版を CDN から読み込む', () => {
    const installed = JSON.parse(
      readFileSync(resolve(__dirname, '../../../node_modules/monaco-editor/package.json'), 'utf8')
    ).version;
    expect(MONACO_VERSION).toBe(installed);
    expect(MONACO_VS_PATH).toContain(`monaco-editor@${installed}/`);
  });
});
