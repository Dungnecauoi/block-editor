# @duxbo/block-editor

> Enterprise-grade, batteries-included block editor built on top of [Editor.js](https://editorjs.io). Packaged with **35+ blocks & inline tools**, productivity plugins (slash commands, find & replace, table of contents, emoji picker, media library, drag & drop, undo/redo, autosave), theme engine, built-in English & Vietnamese i18n, customizable upload adapters, and HTML/Markdown export parsers.

[![npm version](https://img.shields.io/npm/v/@duxbo/block-editor.svg?style=flat-square)](https://www.npmjs.com/package/@duxbo/block-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 🚀 Key Features

- **⚡ Batteries Included**: Stop stitching together 20+ separate npm packages. Everything is bundled and pre-configured to work together harmoniously.
- **🛠️ 30+ Block & Inline Tools**:
  - *Standard*: Paragraph, Header (H1-H6), Nested List, Checklist, Quote, Warning, Delimiter, Raw HTML, Table.
  - *Media*: Image (upload + URL), Video (local + streaming), Audio player, Multi-image Gallery, File Attachments.
  - *Advanced*: Multi-column layouts, Toggle/Accordion, Tabs container, Math/LaTeX equations (KaTeX), Mermaid diagrams, Drawing canvas, Page Break, QR Code, Signature pad, Bar/Line/Pie Chart.
  - *Embeds*: YouTube, Vimeo, CodePen, Social media (Twitter/X, Instagram, TikTok), Google Maps/OpenStreetMap, Custom iFrame.
  - *Inline Formatting*: Marker, Inline Code, Underline, Text Color, Background Color, Tooltips, Case Transform, Text Alignment tune, Indent tune.
- **⌨️ Slash Commands (`/`)**: Notion-style quick menu to search and insert blocks without taking hands off keyboard.
- **🔍 Find & Replace (`Ctrl+F`)**: Search and replace text across every block, with match navigation and case-sensitive toggle.
- **📑 Table of Contents**: Optional floating outline panel auto-generated from headings, with click-to-jump navigation and stable anchor IDs (also embedded in HTML export).
- **😀 Emoji Picker & 🗂️ Media Library**: Quick emoji insertion popover, and a picker to reuse previously uploaded images/videos/files instead of re-uploading.
- **💾 Autosave**: Optional debounced autosave to `localStorage` or a custom callback, with automatic draft restore on reload.
- **👁️ Preview / Read-only Toggle**: One-click switch between editing and a clean read-only preview.
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
| `showFindReplace` | `boolean` | `true` | Enable Find & Replace (`Ctrl+F`) |
| `showTableOfContents` | `boolean` | `false` | Show the floating outline panel |
| `showMediaLibrary` | `boolean` | `true` | Show the Media Library picker button |
| `autosave` | `{ enabled, interval?, key?, onSave? }` | `undefined` | Debounced autosave to `localStorage` and/or a callback |
| `toolbar` | `TopToolbarConfig` | `undefined` | Per-section on/off switches for the top toolbar (see below) |
| `trackMedia` | `{ enabled?, blockTypes? }` | `undefined` | Config for `saveWithMediaChanges()` (see below) |
| `tools` | `Record<string, any>` | `undefined` | Custom or overridden tool configs |
| `onReady` | `() => void` | `undefined` | Ready callback |
| `onChange` | `(data: OutputData) => void` | `undefined` | Content changed callback |

---

## 🎛️ Toolbar Customization

Every section and button of the top toolbar can be toggled independently via `toolbar`, on top of the top-level `showToolbar` (whole bar) / `showFindReplace` / `showTableOfContents` / `showMediaLibrary` switches. Every block/inline tool is toggled the same way via `tools: { toolName: false }`.

```typescript
const editor = new BlockEditor({
  holder: 'editor-container',
  showFindReplace: true,       // Ctrl+F shortcut still works even if the button is hidden
  showTableOfContents: false,
  showMediaLibrary: true,
  toolbar: {
    showHistory: true,        // Undo/Redo
    showHeadings: true,       // Block type dropdown
    showFormatting: true,     // Bold/Italic/Underline/Strike/Highlight/Clear
    showAlignment: true,      // (reserved)
    showLists: true,          // Bullet/Numbered/Checklist
    showInsertMenu: true,     // Image/Video/Table/Tabs/Columns/Divider/Page Break/QR/Chart/Sign
    showBlockActions: true,   // Duplicate/Delete current block
    showStats: true,          // Word/char count
    showFullscreen: true,
    showUtilities: true,      // Find & Replace / Emoji / Media Library icons
    showPreviewToggle: true,  // Read-only preview eye icon
  },
  tools: {
    mermaid: false,           // disable a single block tool
    chart: { config: { /* ... */ } },
  },
});
```

---

## 🖼️ Media Change Tracking (for backend cleanup)

When a block's image/video/audio/attachment/gallery file is added, removed, or replaced, `saveWithMediaChanges()` returns a `mediaChanges` list alongside the usual JSON so your backend knows exactly which uploaded files became orphaned:

```typescript
const { data, mediaChanges } = await editor.saveWithMediaChanges();
// mediaChanges: [{ blockId, blockType, changeType: 'added'|'removed'|'modified', old, new }, ...]

const res = await fetch('/api/articles/123', {
  method: 'PUT',
  body: JSON.stringify({ data, mediaChanges }),
});

if (res.ok) {
  // Only advance the baseline after the backend actually persisted it.
  editor.commitMediaBaseline(data);
}
```

**Diffs against the last *committed* save, not every keystroke.** If a user swaps the same image block 3 times before ever saving, `mediaChanges` still reports one entry with `old` pointing at the file that's actually in your DB (the first one) and `new` pointing at the final choice — the 2nd/3rd intermediate files never existed in the DB and never appear as `old`. If your backend save fails, simply don't call `commitMediaBaseline()` — the next diff will still be computed against the last known-good state, so nothing is missed.

Tracked block types by default: `image`, `simpleImage`, `video`, `audio`, `attaches`, `gallery` (a gallery's individual images are diffed by URL, each add/remove as its own entry). Customize with `trackMedia: { blockTypes: [...] }`, or set `trackMedia: { enabled: false }` to always get an empty list. `diffMediaChanges(oldData, newData)` is also exported standalone if you'd rather compute this diff on the backend from two JSON blobs.

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
await editor.toggleReadOnly();

// Open Find & Replace / Media Library, toggle the outline panel
editor.openFindReplace();
editor.openMediaLibrary();
editor.toggleTableOfContents();

// Save + diff which media files changed since the last confirmed save
const { data, mediaChanges } = await editor.saveWithMediaChanges();
editor.commitMediaBaseline(data); // call only after your backend confirms the save

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
  PageBreakTool,
  QRCodeTool,
  SignatureTool,
  ChartTool,
  FindReplacePlugin,
  TableOfContents,
  EmojiPicker,
  MediaLibrary,
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
