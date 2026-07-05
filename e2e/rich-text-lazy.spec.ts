import { test, expect } from '@playwright/test';

test('リッチテキストエディタ（遅延ロード）が編集パネルに表示される', async ({ page }) => {
  await page.goto('/test-cms.html');
  const cms = page.locator('#test-cms');
  await cms.locator('[data-zcode-id][data-zcode-path="page.0"]').waitFor();

  await cms.locator('.zcode-mode-edit').click();
  await cms.locator('[data-zcode-id][data-zcode-path="page.1"]').click();
  await expect(cms.locator('.zcode-edit-panel')).toBeVisible();

  await expect(cms.locator('.zcode-rich-text-editor-wrapper .ProseMirror').first()).toBeVisible({
    timeout: 10_000
  });
});
