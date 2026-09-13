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
  MediaItem,
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

// Media change tracking (also usable standalone, e.g. on a backend)
export { diffMediaChanges, DEFAULT_MEDIA_BLOCK_TYPES } from './utils/media-diff';
export type { MediaChange } from './utils/media-diff';

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
export { default as PageBreakTool } from './tools/page-break';
export { default as QRCodeTool } from './tools/qrcode';
export { default as SignatureTool } from './tools/signature';
export { default as ChartTool } from './tools/chart';
export { default as TextColorTool } from './tools/text-color';
export { default as HyperlinkTool } from './tools/hyperlink';

// Plugins (individually exportable)
export { FindReplacePlugin } from './plugins/find-replace';
export { TableOfContents } from './plugins/table-of-contents';
export { EmojiPicker } from './plugins/emoji-picker';
export { MediaLibrary } from './plugins/media-library';

// i18n
export { en as localeEn } from './config/i18n/en';
export { vi as localeVi } from './config/i18n/vi';
