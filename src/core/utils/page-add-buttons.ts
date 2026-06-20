function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface AddBetweenButtonLabels {
  before: string;
  after: string;
}

export function renderAddBeforeButton(path: string, label: string): string {
  return renderAddBetweenButton(path, label, 'before');
}

export function renderAddAfterButton(path: string, label: string): string {
  return renderAddBetweenButton(path, label, 'after');
}

function renderAddBetweenButton(path: string, label: string, position: 'before' | 'after'): string {
  const escapedLabel = escapeHtml(label);
  const attribute = position === 'before' ? 'data-zcode-add-before' : 'data-zcode-add-after';
  return `<div class="zcode-add-between zcode-add-between--${position}" data-zcode-add-between><button type="button" class="zcode-add-slot-btn zcode-add-between-btn" ${attribute} data-zcode-path="${path}" aria-label="${escapedLabel}"></button></div>`;
}

export function joinSiblingHtmlWithAddButtons(
  siblingHtmlParts: string[],
  getPathAtIndex: (index: number) => string,
  enableEditorAttributes: boolean,
  labels: AddBetweenButtonLabels
): string {
  if (!enableEditorAttributes || siblingHtmlParts.length === 0) {
    return siblingHtmlParts.join('');
  }

  const parts: string[] = [renderAddBeforeButton(getPathAtIndex(0), labels.before)];

  siblingHtmlParts.forEach((html, index) => {
    parts.push(html);
    parts.push(renderAddAfterButton(getPathAtIndex(index), labels.after));
  });

  return parts.join('');
}

export function joinPageHtmlWithAddButtons(
  pageHtmlParts: string[],
  enableEditorAttributes: boolean,
  labels: AddBetweenButtonLabels
): string {
  return joinSiblingHtmlWithAddButtons(
    pageHtmlParts,
    (index) => `page.${index}`,
    enableEditorAttributes,
    labels
  );
}

export function resolveAddBetweenButtonTarget(
  addTargetPath: string,
  insertBefore: boolean
): { attribute: 'data-zcode-add-before' | 'data-zcode-add-after'; path: string } {
  if (!insertBefore) {
    return { attribute: 'data-zcode-add-after', path: addTargetPath };
  }

  const pageMatch = addTargetPath.match(/^page\.(\d+)$/);
  if (pageMatch) {
    const index = Number(pageMatch[1]);
    if (index === 0) {
      return { attribute: 'data-zcode-add-before', path: addTargetPath };
    }
    return { attribute: 'data-zcode-add-after', path: `page.${index - 1}` };
  }

  const slotItemMatch = addTargetPath.match(/^(.+\.slots\.[^.]+)\.(\d+)$/);
  if (slotItemMatch) {
    const [, slotParentPath, indexStr] = slotItemMatch;
    const index = Number(indexStr);
    if (index === 0) {
      return { attribute: 'data-zcode-add-before', path: addTargetPath };
    }
    return { attribute: 'data-zcode-add-after', path: `${slotParentPath}.${index - 1}` };
  }

  return { attribute: 'data-zcode-add-before', path: addTargetPath };
}

export function syncAddBetweenButtonCurrentState(
  previewArea: HTMLElement | null,
  addTargetPath: string | null,
  insertBefore: boolean
): void {
  if (!previewArea) {
    return;
  }

  previewArea.querySelectorAll('.zcode-add-between-btn.is-current').forEach((button) => {
    button.classList.remove('is-current');
  });

  if (!addTargetPath) {
    return;
  }

  const { attribute, path } = resolveAddBetweenButtonTarget(addTargetPath, insertBefore);
  const selector = `[${attribute}][data-zcode-path="${CSS.escape(path)}"]`;
  previewArea.querySelector(selector)?.classList.add('is-current');
}
