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

## Installation

```bash
npm install zerocodejs
```

ZeroCode.js uses Vue 3 internally. With npm 7+, peer dependencies are installed automatically.

> **Note:** If using npm 6 or earlier, run `npm install zerocodejs vue` explicitly.

## Quick Start

### Basic Usage (Vanilla JS)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ZeroCode.js Example</title>
  <link rel="stylesheet" href="node_modules/zerocodejs/dist/zerocodejs.css">
</head>
<body>
  <zcode-cms id="cms" locale="en">
    <link slot="css" rel="stylesheet" href="/css/common.css" />
  </zcode-cms>

  <script type="module">
    import 'zerocodejs';
    
    const cms = document.getElementById('cms');
    cms.setAttribute('page', JSON.stringify([]));
    cms.setAttribute('parts-common', JSON.stringify([]));
    cms.setAttribute('parts-individual', JSON.stringify([]));
    cms.setAttribute('parts-special', JSON.stringify([]));
    cms.setAttribute('images-common', JSON.stringify([]));
    cms.setAttribute('images-individual', JSON.stringify([]));
    cms.setAttribute('images-special', JSON.stringify([]));
  </script>
</body>
</html>
```

### React

```jsx
import { useEffect } from 'react';
import 'zerocodejs';
import 'zerocodejs/style.css';

function App() {
  useEffect(() => {
    const cms = document.getElementById('cms');
    if (cms) {
      cms.setAttribute('page', JSON.stringify([]));
      cms.setAttribute('parts-common', JSON.stringify([]));
      cms.setAttribute('parts-individual', JSON.stringify([]));
      cms.setAttribute('parts-special', JSON.stringify([]));
      cms.setAttribute('images-common', JSON.stringify([]));
      cms.setAttribute('images-individual', JSON.stringify([]));
      cms.setAttribute('images-special', JSON.stringify([]));
    }
  }, []);

  return <zcode-cms id="cms" locale="en" />;
}
```

### Vue

```vue
<template>
  <zcode-cms id="cms" locale="en" />
</template>

<script setup>
import 'zerocodejs';
import 'zerocodejs/style.css';
</script>
```

### CDN

```html
<!-- Load Vue first -->
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<!-- Load ZeroCode.js -->
<script src="https://unpkg.com/zerocodejs/dist/zerocode.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/zerocodejs/dist/zerocodejs.css">
```

## Components

### `<zcode-cms>`

User-facing CMS editor for content management.

```html
<zcode-cms id="cms" locale="en" />
```

### `<zcode-editor>`

Developer-facing editor with parts management, image management, and data viewer.

```html
<zcode-editor id="editor" locale="en" />
```

## Documentation

- [Technical Specification](./TECHNICAL_SPECIFICATION.md)
- [日本語ドキュメント](./README.ja.md)

## Why ZeroCode.js?

| Feature | ZeroCode.js | GrapesJS | Builder.io | Craft.js |
|---------|-------------|----------|------------|----------|
| Framework Agnostic | Yes | Yes | No | No (React) |
| Web Components | Yes | No | No | No |
| Free & Open Source | Yes | Yes | Partial | Yes |
| Japanese Support | Yes | No | No | No |
| Bundle Size | ~260KB | ~500KB | - | ~150KB |

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

**Last Updated**: January 2025
