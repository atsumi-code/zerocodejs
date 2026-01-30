# ZeroCode.js

[![npm](https://img.shields.io/npm/v/zerocodejs)](https://www.npmjs.com/package/zerocodejs)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/website?down_message=offline&label=Demo&up_message=online&url=https%3A%2F%2Fatsumi-code.github.io%2Fzerocodejs%2F)](https://atsumi-code.github.io/zerocodejs/)

🇯🇵 [日本語ドキュメント](./README.ja.md)

**Framework-agnostic Visual CMS Editor Library built with Web Components**

> **Status: Beta**
>
> ZeroCode.js is currently in beta. APIs, specifications, and data formats may change without notice (including breaking changes).
> Bug reports, feature requests, use case sharing, and documentation feedback are welcome.

## Features

- **Framework Agnostic** - Works with React, Vue, Svelte, Angular, or Vanilla JS via Web Components
- **Visual Editor** - Click to edit, drag to reorder, no coding required for content editing
- **Parts Management** - Create and manage reusable content blocks
- **Image Management** - Built-in image upload and management
- **Flexible Templates** - Custom HTML template syntax for dynamic content
- **Lightweight** - Only ~260KB gzipped
- **i18n Ready** - Built-in Japanese & English UI support

## Demo

**Live Demo:** https://atsumi-code.github.io/zerocodejs/

## Quick Start

### CDN (Easiest)

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/zerocodejs/dist/zerocodejs.css" />
  </head>
  <body>
    <zcode-editor locale="en"></zcode-editor>

    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/zerocodejs/dist/zerocode.umd.js"></script>
  </body>
</html>
```

That's it! Open the file in a browser and start creating parts.

### npm

```bash
npm install zerocodejs
```

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/zerocodejs/dist/zerocodejs.css" />
  </head>
  <body>
    <zcode-editor locale="en"></zcode-editor>

    <script type="module">
      import 'zerocodejs';
    </script>
  </body>
</html>
```

### React

```jsx
import 'zerocodejs';
import 'zerocodejs/style.css';

function App() {
  return <zcode-editor locale="en" />;
}
```

### Vue

```vue
<template>
  <zcode-editor locale="en" />
</template>

<script setup>
import 'zerocodejs';
import 'zerocodejs/style.css';
</script>
```

## Components

### `<zcode-editor>`

Developer-facing editor with parts management, image management, and data viewer. **Recommended for getting started.**

```html
<zcode-editor locale="en"></zcode-editor>
```

### `<zcode-cms>`

User-facing CMS editor for content management (no parts/image management).

```html
<zcode-cms locale="en"></zcode-cms>
```

## Loading Existing Data

To load existing data, set attributes via JavaScript:

```javascript
const editor = document.querySelector('zcode-editor');
editor.setAttribute('page', JSON.stringify(pageData));
editor.setAttribute('parts-common', JSON.stringify(partsData));
// ... other attributes as needed
```

## Documentation

- [Technical Specification](./TECHNICAL_SPECIFICATION.md)
- [日本語ドキュメント](./README.ja.md)

## Why ZeroCode.js?

| Feature            | ZeroCode.js | GrapesJS | Builder.io | Craft.js   |
| ------------------ | ----------- | -------- | ---------- | ---------- |
| Framework Agnostic | Yes         | Yes      | No         | No (React) |
| Web Components     | Yes         | No       | No         | No         |
| Free & Open Source | Yes         | Yes      | Partial    | Yes        |
| Japanese Support   | Yes         | No       | No         | No         |
| Bundle Size        | ~260KB      | ~500KB   | -          | ~150KB     |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md).

We welcome contributions in both **English and Japanese**.

## Security

ZeroCode.js is a frontend library. Complete security cannot be guaranteed on the client side.

### Recommendations

- **Server-side validation is required**: Validate data before saving on the server
- **Implement authentication/authorization**: Only allow authenticated users to modify parts data
- **Verify the source**: Check the `source` field in `save-request` events
- **Template management**: Only use templates from trusted sources

See the [Technical Specification](./TECHNICAL_SPECIFICATION.md) for security details.

## License

MIT License

---

**Last Updated**: January 2026
