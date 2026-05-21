import type { FieldChoiceOption } from './template-regex';

export function parseChoiceOptionSegment(raw: string): FieldChoiceOption {
  const s = raw.trim();
  const eq = s.indexOf('=');
  if (eq === -1) {
    return { label: s, value: s };
  }
  return {
    label: s.slice(0, eq).trim(),
    value: s.slice(eq + 1).trim()
  };
}

export function mapRawChoices(optionsStr: string, delimiter: '|' | ','): FieldChoiceOption[] {
  return optionsStr.split(delimiter).map((seg) => parseChoiceOptionSegment(seg));
}

export function firstChoiceValueFromRaw(optionsStr: string): string {
  if (optionsStr.includes('|')) {
    const first = optionsStr.split('|')[0] ?? '';
    return parseChoiceOptionSegment(first).value;
  }
  if (optionsStr.includes(',')) {
    const first = optionsStr.split(',')[0] ?? '';
    return parseChoiceOptionSegment(first).value;
  }
  return parseChoiceOptionSegment(optionsStr).value;
}

export function rawChoiceValues(optionsStr: string, delimiter: '|' | ','): string[] {
  return mapRawChoices(optionsStr, delimiter).map((o) => o.value);
}
