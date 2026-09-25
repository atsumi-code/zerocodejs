import { test, expect } from '@playwright/test';

test('unsafe-eval を許可しない CSP の下でも zcode-cms が描画される', async ({ page }) => {
  const evalErrors: string[] = [];
  page.on('pageerror', (e) => {
    if (/unsafe-eval|evaluate a string/.test(e.message)) evalErrors.push(e.message);
  });

  // デモページは jQuery（CDN）とインラインスクリプトを使うため、それらは許可し eval だけを禁止する
  await page.route('**/test-cms.html', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'content-security-policy':
          "script-src 'self' 'unsafe-inline' https://code.jquery.com; object-src 'none'"
      }
    });
  });

  await page.goto('/test-cms.html');
  const cms = page.locator('#test-cms');
  await expect(cms.locator('[data-zcode-id][data-zcode-path="page.0"]')).toBeVisible();
  await expect(cms.locator('.zcode-toolbar')).toContainText('編集');
  expect(evalErrors).toEqual([]);
});
