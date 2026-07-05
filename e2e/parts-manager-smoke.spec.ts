import { test, expect } from '@playwright/test';

test.describe('zcode-editor パーツ管理スモークテスト', () => {
  test('パーツ管理タブ→一覧→編集モーダルの開閉ができる', async ({ page }) => {
    await page.goto('/test-dev.html');

    const editor = page.locator('#test-cms');
    await expect(editor.locator('[data-zcode-id][data-zcode-path="page.0"]')).toBeVisible();

    await editor.locator('.zcode-dev-tab', { hasText: 'パーツ管理' }).click();

    const partItems = editor.locator('.zcode-part-item');
    await expect(partItems.first()).toBeVisible();
    expect(await partItems.count()).toBeGreaterThanOrEqual(2);

    await partItems.first().click();
    const modal = editor.locator('.zcode-part-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.zcode-part-editor-header')).toBeVisible();

    await modal.locator('.zcode-close-btn').first().click();
    await expect(modal).toBeHidden();

    await expect(partItems.first()).toBeVisible();
  });

  test('カテゴリ情報モーダルが開閉できる', async ({ page }) => {
    await page.goto('/test-dev.html');
    const editor = page.locator('#test-cms');
    await editor.locator('[data-zcode-id][data-zcode-path="page.0"]').waitFor();

    await editor.locator('.zcode-dev-tab', { hasText: 'パーツ管理' }).click();
    await editor.locator('.zcode-help-btn').first().click();

    const infoModal = editor.locator('.zcode-help-modal');
    await expect(infoModal).toBeVisible();
    await expect(infoModal).toContainText('共通');

    await infoModal.locator('.zcode-close-btn').click();
    await expect(infoModal).toBeHidden();
  });
});
