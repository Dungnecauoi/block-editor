/**
 * @duxbo/block-editor
 * Enterprise-grade block editor built on Editor.js
 */

// Main editor
export { BlockEditor } from './editor';

// Types
export type {
  BlockEditorConfig,
  OutputData,
  OutputBlockData,
  UploadAdapter,
  UploadResponse,
  ThemeConfig,
  LocaleConfig,
  LocaleMessages,
  ToolsConfig,
  EditorEventType,
  EditorEventCallback,
} from './types';

// Parsers
export { renderToHTML } from './parsers/html-renderer';
export { renderToMarkdown } from './parsers/markdown-renderer';

// Upload adapters
export { FetchUploadAdapter } from './adapters/upload-adapter';

// Custom tools (individually exportable)
export { default as VideoTool } from './tools/video';
export { default as AudioTool } from './tools/audio';
export { default as GalleryTool } from './tools/gallery';
export { default as TabsTool } from './tools/tabs';
export { default as MathTool } from './tools/math';
export { default as MermaidTool } from './tools/mermaid';
export { default as DrawingTool } from './tools/drawing';
export { default as IframeTool } from './tools/iframe';
export { default as MapTool } from './tools/map';
export { default as SocialEmbedTool } from './tools/social-embed';

// i18n
export { en as localeEn } from './config/i18n/en';
export { vi as localeVi } from './config/i18n/vi';
