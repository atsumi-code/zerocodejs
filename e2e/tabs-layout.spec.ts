import { test, expect, type Locator, type Page } from '@playwright/test';

// ホスト CSS やブラウザ差でボタンの最小幅が 0 になっても、タブ名が切れず横スクロールになることを確認する
async function forceButtonMinWidthZero(page: Page) {
  await page.evaluate(() => {
    const host = document.querySelector('#test-cms') as HTMLElement & {
      shadowRoot: ShadowRoot | null;
    };
    const style = document.createElement('style');
    style.textContent = 'button { min-width: 0; font-size: 16px !important; }';
    (host.shadowRoot ?? document.head).appendChild(style);
  });
}

async function clippedTabs(tabs: Locator) {
  return tabs.evaluateAll((els) =>
    els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent?.trim())
  );
}

const TYPE_NAMES = [
  'heading',
  'text_image',
  'image_gallery',
  'link_button',
  'profile_card',
  'feature_list',
  'two_column',
  'spacer_large'
];

test.beforeEach(async ({ page }) => {
  await page.goto('/test-cms.html');
  const cms = page.locator('#test-cms');
  await cms.locator('[data-zcode-id][data-zcode-path="page.0"]').waitFor();
  await page.evaluate((names) => {
    const el = document.querySelector('#test-cms') as unknown as {
      getData: (path: string) => unknown;
      setData: (data: object) => void;
    };
    const parts = JSON.parse(JSON.stringify(el.getData('parts')));
    const base = parts.common[0].parts[0];
    const body = `<div>${names.map((n, i) => `{$f${i}.${n}:x}`).join('')}</div>`;
    parts.common = names.map((n, i) => ({
      id: `t${i}`,
      type: n,
      description: '',
      parts: [{ ...base, id: `${base.id}-${i}`, title: n, body }]
    }));
    const values = Object.fromEntries(names.map((n, i) => [`f${i}`, n]));
    el.setData({ parts, page: [{ id: 'c1', part_id: `${base.id}-0`, ...values }] });
  }, TYPE_NAMES);
  await forceButtonMinWidthZero(page);
});

test('追加パネルのタイプタブは名前が切れない', async ({ page }) => {
  const cms = page.locator('#test-cms');
  await cms.locator('.zcode-mode-add').click();
  await cms.locator('.zcode-add-between-btn').first().click();
  await cms.locator('.zcode-category-tab').first().click();
  await expect(cms.locator('.zcode-type-tab')).toHaveCount(TYPE_NAMES.length + 1);
  expect(await clippedTabs(cms.locator('.zcode-type-tab'))).toEqual([]);
  expect(await clippedTabs(cms.locator('.zcode-category-tab'))).toEqual([]);
});

test('編集パネルのグループタブは名前が切れない', async ({ page }) => {
  const cms = page.locator('#test-cms');
  await cms.locator('.zcode-mode-edit').click();
  await cms.locator('[data-zcode-id][data-zcode-path="page.0"]').first().click();
  await expect(cms.locator('.zcode-group-tab')).toHaveCount(TYPE_NAMES.length + 1);
  expect(await clippedTabs(cms.locator('.zcode-group-tab'))).toEqual([]);
});
