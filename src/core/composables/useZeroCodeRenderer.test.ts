import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createZeroCodeI18n } from '../../i18n';
import { useZeroCodeRenderer } from './useZeroCodeRenderer';
import { sampleZeroCodeData } from '../../__tests__/fixtures/sample-data';

const TestComponent = defineComponent({
  setup() {
    const { fullPageHtml, findPart } = useZeroCodeRenderer(sampleZeroCodeData, false);
    return () =>
      h('div', {
        'data-fullpage': fullPageHtml.value,
        'data-findpart': findPart('part-1')?.id ?? ''
      });
  }
});

describe('useZeroCodeRenderer', () => {
  const i18n = createZeroCodeI18n('ja');

  it('should render full page HTML', () => {
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [i18n]
      }
    });

    const html = wrapper.element.getAttribute('data-fullpage');
    expect(html).toBeDefined();
    expect(html).toContain('サンプルタイトル');
  });

  it('should find part by id', () => {
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [i18n]
      }
    });

    const partId = wrapper.element.getAttribute('data-findpart');
    expect(partId).toBe('part-1');
  });

  it('should return error HTML for unknown part_id', () => {
    const ErrorComponent = defineComponent({
      setup() {
        const cmsData = {
          ...sampleZeroCodeData,
          page: [
            {
              id: 'comp-1',
              part_id: 'non-existent-part',
              title: 'Test'
            }
          ]
        };
        const { fullPageHtml } = useZeroCodeRenderer(cmsData, false);
        return () => h('div', { 'data-fullpage': fullPageHtml.value });
      }
    });

    const wrapper = mount(ErrorComponent, {
      global: {
        plugins: [i18n]
      }
    });

    const html = wrapper.element.getAttribute('data-fullpage');
    expect(html).toContain('zcode-error-message');
    expect(html).toContain('パーツが見つかりません');
  });

  it('should render component to HTML', () => {
    const RenderComponent = defineComponent({
      setup() {
        const { renderComponentToHtml } = useZeroCodeRenderer(sampleZeroCodeData, false);
        const html = renderComponentToHtml(sampleZeroCodeData.page[0], 'page.0');
        return () => h('div', { innerHTML: html });
      }
    });

    const wrapper = mount(RenderComponent, {
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.html()).toContain('サンプルタイトル');
  });

  it('should inject add-after buttons when editor attributes are enabled', () => {
    const EditorComponent = defineComponent({
      setup() {
        const { fullPageHtml } = useZeroCodeRenderer(sampleZeroCodeData, true);
        return () => h('div', { 'data-fullpage': fullPageHtml.value });
      }
    });

    const wrapper = mount(EditorComponent, {
      global: {
        plugins: [i18n]
      }
    });

    const html = wrapper.element.getAttribute('data-fullpage');
    expect(html).toContain('data-zcode-add-before');
    expect(html).toContain('data-zcode-add-after');
    expect(html).toContain('data-zcode-path="page.0"');
  });
});
