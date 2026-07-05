import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { useModalA11y } from './useModalA11y';

function pressKey(key: string, options: { shiftKey?: boolean } = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
  document.dispatchEvent(event);
  return event;
}

function createModalContainer(buttonCount: number): HTMLElement {
  const container = document.createElement('div');
  for (let i = 0; i < buttonCount; i++) {
    const button = document.createElement('button');
    button.textContent = `btn-${i}`;
    container.appendChild(button);
  }
  document.body.appendChild(container);
  return container;
}

describe('useModalA11y', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(async () => {
    // 開きっぱなしのモーダルが次のテストへ漏れないよう、各テストで閉じてから終了する
    await nextTick();
  });

  it('開いている間に Esc を押すと onClose が呼ばれる', async () => {
    const open = ref(false);
    const onClose = vi.fn();
    const container = ref<HTMLElement | null>(createModalContainer(1));
    useModalA11y(() => open.value, onClose, container);

    pressKey('Escape');
    expect(onClose).not.toHaveBeenCalled();

    open.value = true;
    await nextTick();
    pressKey('Escape');
    expect(onClose).toHaveBeenCalledTimes(1);

    open.value = false;
    await nextTick();
    pressKey('Escape');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('重なったモーダルでは最前面のみが Esc を処理する', async () => {
    const openA = ref(true);
    const openB = ref(false);
    const closeA = vi.fn();
    const closeB = vi.fn();
    const containerA = ref<HTMLElement | null>(createModalContainer(1));
    const containerB = ref<HTMLElement | null>(createModalContainer(1));

    const flagA = ref(false);
    const flagB = ref(false);
    useModalA11y(() => flagA.value, closeA, containerA);
    useModalA11y(() => flagB.value, closeB, containerB);

    flagA.value = openA.value;
    await nextTick();
    flagB.value = true;
    openB.value = true;
    await nextTick();

    pressKey('Escape');
    expect(closeB).toHaveBeenCalledTimes(1);
    expect(closeA).not.toHaveBeenCalled();

    flagB.value = false;
    await nextTick();
    pressKey('Escape');
    expect(closeA).toHaveBeenCalledTimes(1);

    flagA.value = false;
    await nextTick();
  });

  it('開いたとき最初のフォーカス可能要素にフォーカスが移る', async () => {
    const open = ref(false);
    const container = ref<HTMLElement | null>(createModalContainer(2));
    useModalA11y(() => open.value, vi.fn(), container);

    open.value = true;
    await nextTick();
    await nextTick();

    expect(document.activeElement?.textContent).toBe('btn-0');

    open.value = false;
    await nextTick();
  });

  it('Tab がモーダル内で循環する（最後の要素 → 最初の要素）', async () => {
    const open = ref(false);
    const container = ref<HTMLElement | null>(createModalContainer(3));
    useModalA11y(() => open.value, vi.fn(), container);

    open.value = true;
    await nextTick();
    await nextTick();

    const buttons = Array.from(container.value!.querySelectorAll('button'));
    buttons[2].focus();
    const event = pressKey('Tab');
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].focus();
    const shiftEvent = pressKey('Tab', { shiftKey: true });
    expect(shiftEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[2]);

    open.value = false;
    await nextTick();
  });

  it('モーダル中間の要素での Tab はブラウザ既定に任せる', async () => {
    const open = ref(false);
    const container = ref<HTMLElement | null>(createModalContainer(3));
    useModalA11y(() => open.value, vi.fn(), container);

    open.value = true;
    await nextTick();
    await nextTick();

    const buttons = Array.from(container.value!.querySelectorAll('button'));
    buttons[1].focus();
    const event = pressKey('Tab');
    expect(event.defaultPrevented).toBe(false);

    open.value = false;
    await nextTick();
  });

  it('IME 変換中（isComposing）の Esc では閉じない', async () => {
    const open = ref(false);
    const onClose = vi.fn();
    const container = ref<HTMLElement | null>(createModalContainer(1));
    useModalA11y(() => open.value, onClose, container);

    open.value = true;
    await nextTick();

    const composingEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(composingEvent, 'isComposing', { value: true });
    document.dispatchEvent(composingEvent);
    expect(onClose).not.toHaveBeenCalled();

    pressKey('Escape');
    expect(onClose).toHaveBeenCalledTimes(1);

    open.value = false;
    await nextTick();
  });

  it('shouldIgnoreEscape が true を返す Esc では閉じない', async () => {
    const open = ref(false);
    const onClose = vi.fn();
    const container = ref<HTMLElement | null>(createModalContainer(1));
    let ignore = true;
    useModalA11y(() => open.value, onClose, container, {
      shouldIgnoreEscape: () => ignore
    });

    open.value = true;
    await nextTick();

    pressKey('Escape');
    expect(onClose).not.toHaveBeenCalled();

    ignore = false;
    pressKey('Escape');
    expect(onClose).toHaveBeenCalledTimes(1);

    open.value = false;
    await nextTick();
  });

  it('閉じたときに開く前のフォーカス位置へ戻る', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();

    const open = ref(false);
    const container = ref<HTMLElement | null>(createModalContainer(1));
    useModalA11y(() => open.value, vi.fn(), container);

    open.value = true;
    await nextTick();
    await nextTick();
    expect(document.activeElement?.textContent).toBe('btn-0');

    open.value = false;
    await nextTick();
    expect(document.activeElement).toBe(trigger);
  });
});
