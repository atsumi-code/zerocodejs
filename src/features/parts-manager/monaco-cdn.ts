/**
 * Monaco は @monaco-editor/loader 経由で CDN から読み込む。loader の既定は古い版に固定されているため、
 * npm の monaco-editor（依存・監査の対象）と同じ版を明示する。版を上げるときは package.json と両方を更新する
 * （monaco-cdn.test.ts で一致を検査）。
 */
export const MONACO_VERSION = '0.57.0';

export const MONACO_VS_PATH = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;
