import type { ComponentData, PartData } from '../../types';
import { getFieldLabel } from './path-utils';
import { extractFieldsFromTemplate } from './field-extractor';

export type EditPanelField = {
  type:
    | 'text'
    | 'textarea'
    | 'radio'
    | 'checkbox'
    | 'boolean'
    | 'rich'
    | 'image'
    | 'select'
    | 'select-multiple'
    | 'tag';
  fieldName: string;
  groupName?: string;
  label: string;
  defaultValue?: string;
  options?: string[];
  currentValue: unknown;
  optional?: boolean;
  required?: boolean;
  maxLength?: number;
  readonly?: boolean;
  disabled?: boolean;
};

export function getAvailableFieldsFromPart(
  part: PartData,
  component: ComponentData
): EditPanelField[] {
  const fieldInfos = extractFieldsFromTemplate(part.body);

  return fieldInfos.map((field) => {
    const baseField = {
      fieldName: field.fieldName,
      groupName: field.groupName,
      label: getFieldLabel(field.fieldName),
      required: field.required,
      maxLength: field.maxLength,
      readonly: field.readonly,
      disabled: field.disabled
    };

    const compVal = component[field.fieldName];

    if (field.type === 'text') {
      return {
        ...baseField,
        type: 'text' as const,
        defaultValue: field.defaultValue,
        optional: field.optional,
        currentValue:
          compVal !== undefined ? compVal : field.optional ? undefined : field.defaultValue
      };
    }
    if (field.type === 'textarea') {
      return {
        ...baseField,
        type: 'textarea' as const,
        defaultValue: field.defaultValue,
        optional: field.optional,
        currentValue:
          compVal !== undefined ? compVal : field.optional ? undefined : field.defaultValue || ''
      };
    }
    if (field.type === 'rich') {
      return {
        ...baseField,
        type: 'rich' as const,
        defaultValue: field.defaultValue,
        optional: field.optional,
        currentValue:
          compVal !== undefined ? compVal : field.optional ? undefined : field.defaultValue || ''
      };
    }
    if (field.type === 'radio') {
      return {
        ...baseField,
        type: 'radio' as const,
        options: field.options,
        optional: field.optional,
        currentValue:
          compVal !== undefined ? compVal : field.optional ? undefined : field.options?.[0]
      };
    }
    if (field.type === 'boolean') {
      return {
        ...baseField,
        type: 'boolean' as const,
        defaultValue: field.defaultValue,
        optional: field.optional,
        currentValue: compVal !== undefined ? compVal : true
      };
    }
    if (field.type === 'image') {
      return {
        ...baseField,
        type: 'image' as const,
        defaultValue: field.defaultValue,
        optional: field.optional,
        currentValue:
          compVal !== undefined ? compVal : field.optional ? undefined : field.defaultValue || ''
      };
    }
    if (field.type === 'select') {
      return {
        ...baseField,
        type: 'select' as const,
        options: field.options,
        optional: field.optional,
        currentValue:
          compVal !== undefined ? compVal : field.optional ? undefined : field.options?.[0]
      };
    }
    if (field.type === 'select-multiple') {
      return {
        ...baseField,
        type: 'select-multiple' as const,
        options: field.options,
        optional: field.optional,
        currentValue: Array.isArray(compVal) ? compVal : []
      };
    }
    if (field.type === 'tag') {
      const allTags = [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'div',
        'p',
        'span',
        'li',
        'ul',
        'ol',
        'section',
        'article',
        'aside',
        'nav',
        'header',
        'footer',
        'main',
        'figure',
        'figcaption',
        'blockquote',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td'
      ];
      const tagOptions = field.options || allTags;
      return {
        ...baseField,
        type: 'tag' as const,
        options: tagOptions,
        defaultValue: field.defaultValue || 'div',
        currentValue: compVal !== undefined ? compVal : field.defaultValue || 'div'
      };
    }
    return {
      ...baseField,
      type: 'checkbox' as const,
      options: field.options,
      optional: field.optional,
      currentValue: Array.isArray(compVal) ? compVal : []
    };
  });
}
