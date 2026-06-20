import { ref, nextTick } from 'vue';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { usePanelOptionsPopover } from './usePanelOptionsPopover';

describe('usePanelOptionsPopover', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pointerdown の capture でアンカー外クリック時に閉じる', async () => {
    const anchor = document.createElement('div');
    const trigger = document.createElement('button');
    const outside = document.createElement('button');
    anchor.appendChild(trigger);
    document.body.appendChild(anchor);
    document.body.appendChild(outside);

    const anchorRef = ref<HTMLElement | null>(anchor);
    const { optionsPopoverOpen, toggleOptionsPopover } = usePanelOptionsPopover(anchorRef);

    toggleOptionsPopover();
    expect(optionsPopoverOpen.value).toBe(true);

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    expect(optionsPopoverOpen.value).toBe(false);

    anchor.remove();
    outside.remove();
  });

  it('アンカー内クリックでは閉じない', async () => {
    const anchor = document.createElement('div');
    const trigger = document.createElement('button');
    anchor.appendChild(trigger);
    document.body.appendChild(anchor);

    const anchorRef = ref<HTMLElement | null>(anchor);
    const { optionsPopoverOpen, toggleOptionsPopover } = usePanelOptionsPopover(anchorRef);

    toggleOptionsPopover();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    expect(optionsPopoverOpen.value).toBe(true);

    anchor.remove();
  });

  it('Shadow DOM で target がホストにリターゲットされてもアンカー内なら閉じない', async () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const anchor = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    anchor.appendChild(checkbox);
    shadow.appendChild(anchor);
    document.body.appendChild(host);

    const anchorRef = ref<HTMLElement | null>(anchor);
    const { optionsPopoverOpen, toggleOptionsPopover } = usePanelOptionsPopover(anchorRef);

    toggleOptionsPopover();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    checkbox.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true, cancelable: true })
    );
    expect(optionsPopoverOpen.value).toBe(true);

    host.remove();
  });
});
