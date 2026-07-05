import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    __saveRequests: Array<{
      requestId: string;
      source: string;
      targets: string[];
      timestamp: number;
    }>;
  }
}

const CMS_ID = 'test-cms';

function topLevelComponentIds(page: Page): Promise<string[]> {
  return page.evaluate((id) => {
    const root = document.getElementById(id)?.shadowRoot;
    if (!root) return [];
    return Array.from(root.querySelectorAll('[data-zcode-id][data-zcode-path]'))
      .filter((el) => /^page\.\d+$/.test(el.getAttribute('data-zcode-path') ?? ''))
      .map((el) => el.getAttribute('data-zcode-id') ?? '');
  }, CMS_ID);
}

test.describe('zcode-cms スモークテスト', () => {
  test('パーツ追加→編集→並べ替え→保存で save-request が正しく発火する', async ({ page }) => {
    await page.goto('/test-cms.html');

    const cms = page.locator(`#${CMS_ID}`);
    await expect(cms.locator('[data-zcode-id][data-zcode-path="page.0"]')).toBeVisible();

    await page.evaluate((id) => {
      window.__saveRequests = [];
      document.getElementById(id)?.addEventListener('save-request', (event) => {
        window.__saveRequests.push((event as CustomEvent).detail);
      });
    }, CMS_ID);

    const initialIds = await topLevelComponentIds(page);
    expect(initialIds.length).toBeGreaterThanOrEqual(2);

    // --- 追加モード: 先頭の挿入ボタンからパーツを1つ追加 ---
    await cms.locator('.zcode-mode-add').click();
    await cms.locator('.zcode-add-between-btn').first().click();
    await expect(cms.locator('.zcode-add-panel')).toBeVisible();
    await cms.locator('.zcode-module-preview').first().click();

    await expect
      .poll(async () => (await topLevelComponentIds(page)).length)
      .toBe(initialIds.length + 1);

    // --- 編集モード: 先頭パーツ（追加したパーツ）のテキストフィールドを編集 ---
    // 追加直後の選択は編集モードへハンドオフされ、編集パネルが自動で開く
    await cms.locator('.zcode-mode-edit').click();
    const editPanel = cms.locator('.zcode-edit-panel');
    if (!(await editPanel.isVisible().catch(() => false))) {
      await cms.locator('[data-zcode-id][data-zcode-path="page.0"]').click();
    }
    await expect(editPanel).toBeVisible();

    const textInput = cms.locator('.zcode-text-input').first();
    await expect(textInput).toBeVisible();
    await textInput.fill('E2Eテストで編集した値');

    await expect(cms.locator('[data-zcode-id][data-zcode-path="page.0"]')).toContainText(
      'E2Eテストで編集した値'
    );

    // ハンドオフを持ち越さないよう編集パネルを閉じてから並べ替えへ
    await editPanel.locator('.zcode-close-btn').first().click();

    // --- 並べ替えモード: click-click で先頭パーツを末尾へ移動 ---
    const beforeReorder = await topLevelComponentIds(page);
    const lastIndex = beforeReorder.length - 1;

    await cms.locator('.zcode-mode-reorder').click();
    await cms.locator('[data-zcode-id][data-zcode-path="page.0"]').click();
    await cms.locator(`[data-zcode-id][data-zcode-path="page.${lastIndex}"]`).click();

    await expect
      .poll(async () => topLevelComponentIds(page))
      .toEqual([...beforeReorder.slice(1), beforeReorder[0]]);

    // --- 保存: save-request が正しい内容で発火する ---
    await cms.locator('.zcode-save-btn').click();
    await cms.locator('.zcode-save-confirm-dialog .zcode-btn-primary').click();

    await expect.poll(() => page.evaluate(() => window.__saveRequests.length)).toBe(1);

    const request = await page.evaluate(() => window.__saveRequests[0]);
    expect(request.source).toBe('cms');
    expect(request.targets).toEqual(['page', 'images-special']);
    expect(typeof request.requestId).toBe('string');
    expect(request.requestId.length).toBeGreaterThan(0);
  });
});
