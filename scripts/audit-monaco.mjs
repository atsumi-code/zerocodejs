// Monaco は実行時に CDN から読み込むため devDependencies に置いているが、
// CDN から読み込む版は npm の monaco-editor と一致させている（src/features/parts-manager/monaco-cdn.ts）。
// `npm audit --omit=dev` では対象外になるため、monaco-editor とその配下の既知脆弱性をここで検査する。
import { execFileSync } from 'node:child_process';

const FAILING_SEVERITIES = new Set(['moderate', 'high', 'critical']);

let output;
try {
  output = execFileSync('npm', ['audit', '--json'], { encoding: 'utf8' });
} catch (error) {
  // npm audit は脆弱性があると終了コード 1 を返すが、JSON は stdout に出力される
  output = error.stdout;
}

const { vulnerabilities = {} } = JSON.parse(output);
const findings = Object.values(vulnerabilities).filter(
  (vulnerability) =>
    FAILING_SEVERITIES.has(vulnerability.severity) &&
    vulnerability.nodes.some((node) => node.startsWith('node_modules/monaco-editor'))
);

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(`${finding.name} (${finding.severity}): ${finding.nodes.join(', ')}`);
  }
  console.error(
    'monaco-editor に既知の脆弱性があります。monaco-editor と MONACO_VERSION を更新してください。'
  );
  process.exit(1);
}

console.log('monaco-editor: no known moderate or higher vulnerabilities');
