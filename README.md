# @duxbo/block-editor

> Enterprise-grade, batteries-included block editor built on top of [Editor.js](https://editorjs.io). Packaged with **30+ blocks & inline tools**, productivity plugins (slash commands, drag & drop, undo/redo), theme engine, built-in English & Vietnamese i18n, customizable upload adapters, and HTML/Markdown export parsers.

[![npm version](https://img.shields.io/npm/v/@duxbo/block-editor.svg?style=flat-square)](https://www.npmjs.com/package/@duxbo/block-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 🚀 Key Features

- **⚡ Batteries Included**: Stop stitching together 20+ separate npm packages. Everything is bundled and pre-configured to work together harmoniously.
- **🛠️ 30+ Block & Inline Tools**:
  - *Standard*: Paragraph, Header (H1-H6), Nested List, Checklist, Quote, Warning, Delimiter, Raw HTML, Table.
  - *Media*: Image (upload + URL), Video (local + streaming), Audio player, Multi-image Gallery, File Attachments.
  - *Advanced*: Multi-column layouts, Toggle/Accordion, Tabs container, Math/LaTeX equations (KaTeX), Mermaid diagrams, Drawing canvas.
  - *Embeds*: YouTube, Vimeo, CodePen, Social media (Twitter/X, Instagram, TikTok), Google Maps/OpenStreetMap, Custom iFrame.
  - *Inline Formatting*: Marker, Inline Code, Underline, Text Color, Background Color, Tooltips, Case Transform, Text Alignment tune, Indent tune.
- **⌨️ Slash Commands (`/`)**: Notion-style quick menu to search and insert blocks without taking hands off keyboard.
- **🎯 Drag & Drop & History**: Native block reordering handle and full Undo / Redo history (`Ctrl+Z`, `Ctrl+Y`).
- **🎨 Modern Theme Engine**: Switch between `default` (Light), `dark`, and `minimal` themes on the fly, or override with CSS Custom Properties.
- **🌐 Built-in i18n**: Out-of-the-box support for **Vietnamese** (`vi`) and **English** (`en`), extensible to any language.
- **🔄 Universal Exporters**: Export structured editor JSON directly to semantic, sanitized **HTML** (`toHTML()`) or clean **Markdown** (`toMarkdown()`).
- **📦 Enterprise Upload Adapter**: Unified interface for file, image, audio, and video uploads with authentication headers, form data customization, and fallback handlers.
- **🛡️ Full TypeScript Support**: First-class type definitions included.

---

## 📦 Installation

```bash
npm install @duxbo/block-editor
# or
yarn add @duxbo/block-editor
# or
pnpm add @duxbo/block-editor
```

---

## ⚡ Quick Start

### 1. Basic Usage (Vanilla JS / TypeScript)

```typescript
import { BlockEditor } from '@duxbo/block-editor';
import '@duxbo/block-editor/style.css';

const editor = new BlockEditor({
  holder: 'editor-container',
  placeholder: 'Type "/" for commands, or start typing...',
  theme: 'default', // 'default' | 'dark' | 'minimal'
  locale: 'vi',    // 'vi' | 'en'
  onChange: async (data) => {
    console.log('Content updated:', data);
  },
  onReady: () => {
    console.log('Editor is ready!');
  }
});

// Save content as JSON
const data = await editor.save();

// Export to HTML
const html = await editor.toHTML();

// Export to Markdown
const markdown = await editor.toMarkdown();
```

### 2. HTML Container

```html
<div id="editor-container" style="max-width: 860px; margin: 0 auto;"></div>
```

---

## 🎨 Themes

Change themes dynamically or via config:

```typescript
// At initialization
const editor = new BlockEditor({
  holder: 'editor-container',
  theme: 'dark' // 'default' | 'dark' | 'minimal'
});

// Dynamically at runtime
editor.setTheme('dark');
editor.setTheme('minimal');
editor.setTheme('default');
```

### Custom Theme Variables

You can customize the editor appearance by overriding CSS variables:

```css
:root {
  --be-primary: #4f46e5;
  --be-primary-hover: #4338ca;
  --be-bg: #ffffff;
  --be-bg-secondary: #f9fafb;
  --be-text: #111827;
  --be-text-secondary: #6b7280;
  --be-border: #e5e7eb;
  --be-radius: 8px;
  --be-font-family: 'Inter', -apple-system, sans-serif;
}
```

---

## 🌐 Localization (i18n)

Support for English (`en`) and Vietnamese (`vi`) is built-in:

```typescript
const editor = new BlockEditor({
  holder: 'editor-container',
  locale: 'vi', // Automatically translates all tool labels and UI buttons
});
```

You can also provide custom messages:

```typescript
const editor = new BlockEditor({
  holder: 'editor-container',
  localeConfig: {
    locale: 'fr',
    messages: {
      toolNames: {
        'Heading': 'Titre',
        'Text': 'Texte',
      },
      // ...custom translations
    }
  }
});
```

---

## 📤 Upload Adapter Configuration

Configure a backend endpoint to handle media uploads (images, audio, video, attachments):

```typescript
const editor = new BlockEditor({
  holder: 'editor-container',
  uploadAdapter: {
    endpoint: 'https://api.yourdomain.com/v1/media/upload',
    fieldName: 'file',
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  }
});
```

The endpoint is expected to return:
```json
{
  "success": 1,
  "file": {
    "url": "https://cdn.yourdomain.com/uploads/photo.jpg",
    "size": 1048576,
    "name": "photo.jpg"
  }
}
```

---

## ⚙️ Configuration Options (`BlockEditorConfig`)

| Option | Type | Default | Description |
|---|---|---|---|
| `holder` | `string \| HTMLElement` | `'editorjs'` | Container element ID or node |
| `data` | `OutputData` | `undefined` | Initial editor data |
| `placeholder` | `string` | `'Type "/" for commands...'` | Editor placeholder |
| `readOnly` | `boolean` | `false` | Enable read-only mode |
| `autofocus` | `boolean` | `false` | Focus editor on mount |
| `theme` | `'default' \| 'dark' \| 'minimal'` | `'default'` | Theme scheme |
| `locale` | `'en' \| 'vi'` | `'en'` | UI language |
| `uploadAdapter` | `UploadConfig \| UploadAdapter` | `undefined` | Upload handler config |
| `enableSlashCommand` | `boolean` | `true` | Enable `/` slash command popup |
| `enableDragDrop` | `boolean` | `true` | Enable block drag & drop handles |
| `enableUndoRedo` | `boolean` | `true` | Enable undo/redo history |
| `tools` | `Record<string, any>` | `undefined` | Custom or overridden tool configs |
| `onReady` | `() => void` | `undefined` | Ready callback |
| `onChange` | `(data: OutputData) => void` | `undefined` | Content changed callback |

---

## 🧰 Public API Methods

```typescript
const editor = new BlockEditor({ holder: 'editor' });

// Save JSON
const data = await editor.save();

// Render existing data
await editor.render(savedData);

// Clear editor content
await editor.clear();

// Export formats
const htmlString = await editor.toHTML();
const markdownString = await editor.toMarkdown();

// Dynamic theme
editor.setTheme('dark');

// Dynamic read-only toggle
await editor.readOnly.toggle();

// Events
editor.on('change', (data) => console.log('Changed', data));
editor.on('themeChange', (theme) => console.log('Theme:', theme));

// Cleanup
await editor.destroy();
```

---

## 🧩 Standalone Custom Tools Export

All custom tools are individually exported if you want to use them with a custom Editor.js instance:

```typescript
import {
  VideoTool,
  AudioTool,
  GalleryTool,
  TabsTool,
  MathTool,
  MermaidTool,
  DrawingTool,
  IframeTool,
  MapTool,
  SocialEmbedTool,
  renderToHTML,
  renderToMarkdown,
} from '@duxbo/block-editor';
```

---

## 💻 Local Development & Demo

```bash
# Clone the repository
git clone https://github.com/duxbo/block-editor.git

# Install dependencies
npm install

# Start Vite dev server with interactive demo
npm run dev

# Check TypeScript
npm run typecheck

# Production build
npm run build
```

The interactive demo includes theme switching, Vietnamese/English toggles, slash commands, and real-time JSON, HTML, and Markdown inspection.

---

## 📄 License

MIT © [Duxbo](https://github.com/duxbo)
