import { getDOMParser } from './dom-utils';

export function injectAttributesToRootElement(html: string, attrs: Record<string, string>): string {
  const DOMParser = getDOMParser();
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<template>${html}</template>`, 'text/html');
  const template = doc.querySelector('template');

  if (!template || !template.content.firstElementChild) {
    console.warn('Failed to parse HTML:', html);
    return html;
  }

  const rootElement = template.content.firstElementChild as HTMLElement;

  Object.entries(attrs).forEach(([key, value]) => {
    rootElement.setAttribute(key, value);
  });

  return rootElement.outerHTML;
}

export function processImageField(
  value: string,
  defaultValue: string | undefined,
  imagesCommon: Array<{ id: string; url: string }>,
  imagesIndividual: Array<{ id: string; url: string }>,
  imagesSpecial: Array<{ id: string; url: string }> = []
): string {
  // 検索順序（優先度の高い順）：common → individual → special
  const allImages = [...imagesCommon, ...imagesIndividual, ...imagesSpecial];

  if (value) {
    const image = allImages.find((img) => img.id === value);
    if (image) {
      return image.url;
    }
  }

  if (defaultValue) {
    const defaultImage = allImages.find((img) => img.id === defaultValue);
    if (defaultImage) {
      console.warn(`Image not found: ${value}, using default: ${defaultValue}`);
      return defaultImage.url;
    }
  }

  console.warn(`Image not found: ${value}, default: ${defaultValue}`);
  return '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function resolveBackendDataPath(backendData: Record<string, unknown>, path: string): string {
  if (!backendData || !path) return '';

  try {
    const parts: string[] = [];
    let currentPart = '';

    for (let i = 0; i < path.length; i++) {
      const char = path[i];
      if (char === '[') {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
      } else if (char === ']') {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
      } else if (char === '.') {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
      } else {
        currentPart += char;
      }
    }

    if (currentPart) {
      parts.push(currentPart);
    }

    let current: unknown = backendData;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part.match(/^\d+$/)) {
        const index = parseInt(part, 10);
        if (Array.isArray(current) && index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return '';
        }
      } else {
        if (isRecord(current) && part in current) {
          current = current[part];
        } else {
          return '';
        }
      }
    }

    if (current === null || current === undefined) {
      return '';
    }

    return String(current);
  } catch (error) {
    console.warn(`[ZeroCode] Failed to resolve backend data path: ${path}`, error);
    return '';
  }
}

export function expandUrlPlaceholders(url: string, backendData: Record<string, unknown>): string {
  if (!url || !backendData) return url;

  return url.replace(/\{(\w+)\}/g, (match, key) => {
    const value = backendData[key];
    if (value === null || value === undefined) {
      return match;
    }
    return String(value);
  });
}
