import type EditorJS from '@editorjs/editorjs';
import type { TopToolbarConfig } from '../ui/toolbar';

// ============================================================
// Core Types
// ============================================================

export interface OutputData {
  time?: number;
  blocks: OutputBlockData[];
  version?: string;
}

export interface OutputBlockData {
  id?: string;
  type: string;
  data: Record<string, unknown>;
  tunes?: Record<string, unknown>;
}

// ============================================================
// Upload Types
// ============================================================

export interface UploadResponse {
  success: boolean;
  file: {
    url: string;
    name?: string;
    size?: number;
    extension?: string;
    [key: string]: unknown;
  };
}

export interface UploadAdapter {
  /**
   * Upload a file and return the URL
   */
  uploadByFile(file: File): Promise<UploadResponse>;

  /**
   * Upload by URL (download then re-host)
   */
  uploadByUrl?(url: string): Promise<UploadResponse>;

  /**
   * List previously uploaded media for the Media Library picker
   */
  listMedia?(): Promise<MediaItem[]>;
}

// ============================================================
// Media Library Types
// ============================================================

export interface MediaItem {
  url: string;
  name?: string;
  type?: 'image' | 'video' | 'audio' | 'file';
  thumbnail?: string;
}

// ============================================================
// Theme Types
// ============================================================

export interface ThemeConfig {
  name: string;
  variables: Record<string, string>;
  css?: string;
}

// ============================================================
// Locale Types
// ============================================================

export interface LocaleMessages {
  ui: {
    blockTunes: {
      toggler: { 'Click to tune': string };
    };
    inlineToolbar: {
      converter: { 'Convert to': string };
    };
    toolbar: {
      toolbox: { Add: string };
    };
    popover: {
      Filter: string;
      'Nothing found': string;
    };
  };
  toolNames: Record<string, string>;
  tools: Record<string, Record<string, string>>;
  blockTunes: Record<string, Record<string, string>>;
}

export interface LocaleConfig {
  code: string;
  messages: LocaleMessages;
}

// ============================================================
// Tool Config Types
// ============================================================

export type ToolOverride = {
  enabled?: boolean;
  config?: Record<string, unknown>;
};

export type ToolsConfig = {
  [toolName: string]: ToolOverride | boolean;
};

// ============================================================
// Editor Config Types
// ============================================================

export interface BlockEditorConfig {
  /**
   * Element ID or HTMLElement to attach the editor
   */
  holder: string | HTMLElement;

  /**
   * Override or disable specific tools
   * Use `false` to disable a tool, or an object to configure it
   */
  tools?: ToolsConfig;

  /**
   * Enable all available tools (default: true)
   */
  enableAll?: boolean;

  /**
   * Initial editor data
   */
  data?: OutputData;

  /**
   * Placeholder text when editor is empty
   */
  placeholder?: string;

  /**
   * Read-only mode
   */
  readOnly?: boolean;

  /**
   * Custom upload adapter for media tools
   */
  uploadAdapter?: UploadAdapter;

  /**
   * Simple upload endpoint URL (POST multipart/form-data)
   * Response must be: { success: 1, file: { url: "..." } }
   */
  uploadEndpoint?: string;

  /**
   * Editor theme
   */
  theme?: 'default' | 'dark' | 'minimal' | ThemeConfig;

  /**
   * Localization
   */
  locale?: 'en' | 'vi' | LocaleConfig;

  /**
   * Enable drag & drop block reordering (default: true)
   */
  enableDragDrop?: boolean;

  /**
   * Enable undo/redo (default: true)
   */
  enableUndoRedo?: boolean;

  /**
   * Enable slash command menu (default: true)
   */
  enableSlashCommand?: boolean;

  /**
   * Show top sticky quick action toolbar (default: true)
   */
  showToolbar?: boolean;

  /**
   * Show floating quick action bar on hovered block (default: true)
   */
  showHoverActions?: boolean;

  /**
   * Minimum editor height in pixels
   */
  minHeight?: number;

  /**
   * Log level: 'VERBOSE' | 'INFO' | 'WARN' | 'ERROR'
   */
  logLevel?: 'VERBOSE' | 'INFO' | 'WARN' | 'ERROR';

  /**
   * Show Find & Replace (Ctrl+F) (default: true)
   */
  showFindReplace?: boolean;

  /**
   * Show floating Table of Contents outline panel (default: false)
   */
  showTableOfContents?: boolean;

  /**
   * Show the Media Library picker button in the toolbar (default: true)
   */
  showMediaLibrary?: boolean;

  /**
   * Fine-grained on/off switches for every section/button of the top toolbar
   * (history, headings, formatting, alignment, lists, insert menu, block
   * actions, word/char stats, fullscreen, find/emoji/media utilities,
   * preview toggle). Omit a key to keep its default (all `true`).
   */
  toolbar?: TopToolbarConfig;

  /**
   * Media change tracking. When you call `saveWithMediaChanges()`, the
   * returned `mediaChanges` list diffs every media block (image, gallery,
   * video, audio, attaches — configurable via `blockTypes`) against the
   * last *committed* baseline (see `commitMediaBaseline()`), not against
   * every intermediate keystroke — so N unsaved swaps of the same block
   * collapse into one accurate {old, new} pair.
   */
  trackMedia?: {
    /** Default: true */
    enabled?: boolean;
    /** Block types to diff. Default: image, simpleImage, video, audio, attaches, gallery */
    blockTypes?: string[];
  };

  /**
   * Autosave configuration. When enabled, calls `onAutosave`
   * (or persists to localStorage when `key` is given) periodically.
   */
  autosave?: {
    enabled?: boolean;
    /** Debounce interval in ms (default: 2000) */
    interval?: number;
    /** localStorage key to persist to */
    key?: string;
    onSave?: (data: OutputData) => void;
  };

  // ---- Callbacks ----

  /**
   * Called when editor content changes
   */
  onChange?: (data: OutputData) => void;

  /**
   * Called when editor is ready
   */
  onReady?: () => void;
}

// ============================================================
// Event Types
// ============================================================

export type EditorEventType =
  | 'ready'
  | 'change'
  | 'save'
  | 'autosave'
  | 'block-added'
  | 'block-removed'
  | 'block-moved'
  | 'block-changed'
  | 'toolbar-opened'
  | 'toolbar-closed';

export type EditorEventCallback = (...args: unknown[]) => void;

// ============================================================
// Re-export EditorJS type
// ============================================================

export type EditorJSInstance = EditorJS;
