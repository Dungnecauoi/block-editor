/**
 * BlockEditor — Main editor class for @duxbo/block-editor
 * Wraps Editor.js with all plugins pre-configured
 */
import EditorJS from '@editorjs/editorjs';
import type {
  BlockEditorConfig,
  OutputData,
  EditorEventType,
  EditorEventCallback,
  ThemeConfig,
  LocaleConfig,
  MediaItem,
} from './types';

// Official plugins
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Warning from '@editorjs/warning';
import Delimiter from '@editorjs/delimiter';
import NestedList from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
import ImageTool from '@editorjs/image';
import SimpleImage from '@editorjs/simple-image';
import LinkTool from '@editorjs/link';
import Attaches from '@editorjs/attaches';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import RawTool from '@editorjs/raw';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Underline from '@editorjs/underline';
import TextVariantTune from '@editorjs/text-variant-tune';

// Community plugins
// @ts-ignore
import DragDrop from 'editorjs-drag-drop';
// @ts-ignore
import Undo from 'editorjs-undo';
// @ts-ignore
import Alert from 'editorjs-alert';
// @ts-ignore
import editorjsColumns from '@calumk/editorjs-columns';
// @ts-ignore
import CodeFlask from '@calumk/editorjs-codeflask';
// @ts-ignore
import ToggleBlock from 'editorjs-toggle-block';
// @ts-ignore
// @ts-ignore
import AlignmentTune from 'editorjs-text-alignment-blocktune';
// @ts-ignore
import Tooltip from 'editorjs-tooltip';
// @ts-ignore
import ChangeCase from 'editorjs-change-case';
// @ts-ignore
import IndentTune from 'editorjs-indent-tune';

// Custom tools
import VideoTool from './tools/video';
import AudioTool from './tools/audio';
import GalleryTool from './tools/gallery';
import TabsTool from './tools/tabs';
import MathTool from './tools/math';
import MermaidTool from './tools/mermaid';
import DrawingTool from './tools/drawing';
import IframeTool from './tools/iframe';
import MapTool from './tools/map';
import SocialEmbedTool from './tools/social-embed';
import PageBreakTool from './tools/page-break';
import QRCodeTool from './tools/qrcode';
import SignatureTool from './tools/signature';
import ChartTool from './tools/chart';
import TextColorTool from './tools/text-color';
import HyperlinkTool from './tools/hyperlink';

// Block tunes
import BlockActionsTune from './tunes/block-actions';

// Plugins & UI
import SlashCommandPlugin from './plugins/slash-command';
import { BlockHoverActions } from './plugins/block-hover-actions';
import { TopToolbar } from './ui/toolbar';
import { FindReplacePlugin } from './plugins/find-replace';
import { TableOfContents } from './plugins/table-of-contents';
import { EmojiPicker } from './plugins/emoji-picker';
import { MediaLibrary } from './plugins/media-library';
import { InlineToolbarClamp } from './plugins/inline-toolbar-clamp';
import { diffMediaChanges, type MediaChange } from './utils/media-diff';

// Parsers
import { renderToHTML } from './parsers/html-renderer';
import { renderToMarkdown } from './parsers/markdown-renderer';

// Upload adapter
import { FetchUploadAdapter } from './adapters/upload-adapter';

// i18n
import { en } from './config/i18n/en';
import { vi } from './config/i18n/vi';

// Styles
import './themes/default.css';
import './themes/dark.css';
import './themes/minimal.css';
import './ui/toolbar.css';
import './plugins/block-hover-actions/block-hover-actions.css';
import './tools/video/video.css';
import './tools/audio/audio.css';
import './tools/gallery/gallery.css';
import './tools/tabs/tabs.css';
import './tools/math/math.css';
import './tools/mermaid/mermaid.css';
import './tools/drawing/drawing.css';
import './tools/iframe/iframe.css';
import './tools/map/map.css';
import './tools/social-embed/social-embed.css';
import './tools/page-break/page-break.css';
import './tools/qrcode/qrcode.css';
import './tools/signature/signature.css';
import './tools/chart/chart.css';
import './tools/text-color/text-color.css';
import './tools/hyperlink/hyperlink.css';
import './plugins/slash-command/slash-command.css';
import './plugins/find-replace/find-replace.css';
import './plugins/table-of-contents/table-of-contents.css';
import './plugins/emoji-picker/emoji-picker.css';
import './plugins/media-library/media-library.css';

// ============================================================

const LOCALES: Record<string, any> = { en, vi };

export class BlockEditor {
  private editor: EditorJS | null = null;
  private config: BlockEditorConfig;
  private holderElement: HTMLElement | null = null;
  private wrapperElement: HTMLElement | null = null;
  private events: Map<string, Set<EditorEventCallback>> = new Map();
  private slashCommand: SlashCommandPlugin | null = null;
  private undoPlugin: any = null;
  private topToolbar: TopToolbar | null = null;
  private hoverActions: BlockHoverActions | null = null;
  private findReplace: FindReplacePlugin | null = null;
  private toc: TableOfContents | null = null;
  private inlineToolbarClamp: InlineToolbarClamp | null = null;
  private emojiPicker: EmojiPicker | null = null;
  private mediaLibrary: MediaLibrary | null = null;
  private recentMedia: MediaItem[] = [];
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private mediaBaseline: OutputData;
  private lastSavedSnapshot: OutputData | null = null;

  constructor(config: BlockEditorConfig) {
    this.config = {
      enableAll: true,
      enableDragDrop: true,
      enableUndoRedo: true,
      enableSlashCommand: true,
      showToolbar: true,
      showHoverActions: true,
      showFindReplace: true,
      showMediaLibrary: true,
      showTableOfContents: false,
      placeholder: 'Type "/" for commands, or start writing...',
      logLevel: 'ERROR',
      ...config,
    };

    // Baseline represents "what's confirmed saved" (what the caller loaded
    // from their backend) — never the autosave draft, which is by definition
    // not yet persisted.
    this.mediaBaseline = this.config.data || { blocks: [] };

    this._init();
  }

  // ============================================================
  // Initialization
  // ============================================================

  private async _init(): Promise<void> {
    // Resolve holder
    if (typeof this.config.holder === 'string') {
      this.holderElement = document.getElementById(this.config.holder);
    } else {
      this.holderElement = this.config.holder;
    }

    if (!this.holderElement) {
      throw new Error(`[BlockEditor] Holder element not found: ${this.config.holder}`);
    }

    // Create wrapper
    this.wrapperElement = document.createElement('div');
    this.wrapperElement.classList.add('be-editor');

    // Apply theme
    this._applyTheme(this.config.theme || 'default');

    const editorHolder = document.createElement('div');
    editorHolder.id = `be-inner-${Date.now()}`;
    this.wrapperElement.appendChild(editorHolder);
    this.holderElement.appendChild(this.wrapperElement);

    // Build upload config
    const uploadConfig = this._buildUploadConfig();

    // Build i18n
    const i18n = this._buildI18n();

    // Build tools
    const tools = this._buildTools(uploadConfig);

    // Build tunes
    const tunes = ['textVariant', 'alignmentTune', 'blockActions'];

    // Restore an autosaved draft if no explicit initial data was given
    const initialData = this.config.data || this._loadAutosavedDraft() || { blocks: [] };

    // Create EditorJS instance
    this.editor = new EditorJS({
      holder: editorHolder.id,
      data: initialData,
      placeholder: this.config.placeholder,
      readOnly: this.config.readOnly || false,
      logLevel: this.config.logLevel as any,
      minHeight: this.config.minHeight || 100,
      tools,
      tunes,
      i18n: i18n as any,
      onChange: async () => {
        if (this.editor) {
          const data = await this.editor.save();
          this.config.onChange?.(data);
          this._emit('change', data);
          this._scheduleAutosave();
        }
      },
      onReady: () => {
        // Initialize plugins
        if (this.config.enableDragDrop && this.editor) {
          try { new DragDrop(this.editor); } catch {}
        }
        if (this.config.enableUndoRedo && this.editor) {
          try { this.undoPlugin = new Undo({ editor: this.editor }); } catch {}
        }
        if (this.config.enableSlashCommand && this.editor) {
          this.slashCommand = new SlashCommandPlugin(this.editor);
          this.slashCommand.attach();
        }
        if (this.config.showHoverActions !== false && this.editor && this.wrapperElement) {
          this.hoverActions = new BlockHoverActions(this.editor, this.wrapperElement);
        }
        if (this.config.showFindReplace !== false && this.wrapperElement) {
          this.findReplace = new FindReplacePlugin(this.wrapperElement);
          this.findReplace.attach();
        }
        if (this.wrapperElement) {
          this.inlineToolbarClamp = new InlineToolbarClamp(this.wrapperElement);
          this.inlineToolbarClamp.attach();
        }
        if (this.wrapperElement) {
          this.emojiPicker = new EmojiPicker(this.wrapperElement);
        }
        if (this.wrapperElement) {
          this.mediaLibrary = new MediaLibrary(this.wrapperElement, {
            getItems: () => this._getMediaLibraryItems(),
            onSelect: (item) => this._insertMediaItem(item),
          });
        }
        // Instantiated after the plugins above so the toolbar's button-ready
        // callbacks (fired synchronously during construction) find them ready.
        if (this.config.showToolbar !== false && this.editor && this.wrapperElement) {
          this.topToolbar = new TopToolbar(this.editor, this.wrapperElement, this.config.toolbar, {
            onFindReplace: () => this.findReplace?.open(),
            onMediaLibrary: () => this.mediaLibrary?.open(),
            onEmojiButtonReady: (btn) => this.emojiPicker?.attach(btn),
          });
        }
        if (this.config.showTableOfContents && this.wrapperElement) {
          const contentRoot = this.wrapperElement.querySelector('.codex-editor') as HTMLElement | null;
          if (contentRoot) {
            this.toc = new TableOfContents(this.wrapperElement, contentRoot);
            this.toc.attach();
          }
        }
        if (this.config.autosave?.enabled) {
          this._scheduleAutosave();
        }

        this.config.onReady?.();
        this._emit('ready');
      },
    });
  }

  // ============================================================
  // Autosave
  // ============================================================

  private _loadAutosavedDraft(): OutputData | null {
    const key = this.config.autosave?.key;
    if (!this.config.autosave?.enabled || !key) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as OutputData) : null;
    } catch {
      return null;
    }
  }

  private _scheduleAutosave(): void {
    if (!this.config.autosave?.enabled) return;
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    const interval = this.config.autosave.interval ?? 2000;
    this.autosaveTimer = setTimeout(async () => {
      if (!this.editor) return;
      const data = await this.editor.save();
      const key = this.config.autosave?.key;
      if (key) {
        try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
      }
      this.config.autosave?.onSave?.(data);
      this._emit('autosave', data);
    }, interval);
  }

  // ============================================================
  // Media Library
  // ============================================================

  private async _getMediaLibraryItems(): Promise<MediaItem[]> {
    if (this.config.uploadAdapter?.listMedia) {
      try {
        const items = await this.config.uploadAdapter.listMedia();
        return [...items, ...this.recentMedia];
      } catch {
        return this.recentMedia;
      }
    }
    return this.recentMedia;
  }

  private _insertMediaItem(item: MediaItem): void {
    if (!this.editor) return;
    try {
      const currentIndex = this.editor.blocks.getCurrentBlockIndex();
      const insertAt = currentIndex >= 0 ? currentIndex + 1 : this.editor.blocks.getBlocksCount();
      const type = item.type === 'video' ? 'video' : item.type === 'audio' ? 'audio' : item.type === 'file' ? 'attaches' : 'image';
      const data = type === 'image'
        ? { file: { url: item.url }, caption: item.name || '' }
        : type === 'attaches'
          ? { file: { url: item.url, name: item.name } }
          : { url: item.url, title: item.name || '', caption: item.name || '' };
      this.editor.blocks.insert(type, data, {}, insertAt, true);
    } catch (err) {
      console.warn('Failed to insert media item:', err);
    }
  }

  // ============================================================
  // Tool building
  // ============================================================

  private _buildTools(uploadConfig: any): Record<string, any> {
    const isEnabled = (name: string): boolean => {
      if (this.config.tools) {
        const override = this.config.tools[name];
        if (override === false) return false;
        if (typeof override === 'object' && override.enabled === false) return false;
      }
      return this.config.enableAll !== false;
    };

    const getConfig = (name: string, defaultConfig: any): any => {
      if (this.config.tools) {
        const override = this.config.tools[name];
        if (typeof override === 'object' && override.config) {
          return { ...defaultConfig, ...override.config };
        }
      }
      return defaultConfig;
    };

    const tools: Record<string, any> = {};

    // Text & Typography
    if (isEnabled('paragraph')) {
      tools.paragraph = {
        class: Paragraph,
        inlineToolbar: true,
        config: getConfig('paragraph', { placeholder: 'Type or paste your text here...', preserveBlank: true }),
      };
    }

    if (isEnabled('header')) {
      tools.header = {
        class: Header,
        inlineToolbar: true,
        config: getConfig('header', { placeholder: 'Enter a heading', levels: [1, 2, 3, 4, 5, 6], defaultLevel: 2 }),
      };
    }

    if (isEnabled('quote')) {
      tools.quote = { class: Quote, inlineToolbar: true, config: getConfig('quote', {}) };
    }

    if (isEnabled('warning')) {
      tools.warning = { class: Warning, inlineToolbar: true, config: getConfig('warning', {}) };
    }

    if (isEnabled('delimiter')) {
      tools.delimiter = { class: Delimiter };
    }

    if (isEnabled('alert')) {
      tools.alert = { class: Alert, inlineToolbar: true, config: getConfig('alert', { defaultType: 'primary' }) };
    }

    if (isEnabled('toggle')) {
      tools.toggle = { class: ToggleBlock, inlineToolbar: true };
    }

    // Lists
    if (isEnabled('list')) {
      tools.list = { class: NestedList, inlineToolbar: true, config: getConfig('list', { defaultStyle: 'unordered' }) };
    }

    if (isEnabled('checklist')) {
      tools.checklist = { class: Checklist, inlineToolbar: true };
    }

    // Media
    if (isEnabled('image')) {
      tools.image = { class: ImageTool, config: getConfig('image', { captionPlaceholder: 'Image caption', ...uploadConfig }) };
    }

    if (isEnabled('simpleImage')) {
      tools.simpleImage = { class: SimpleImage };
    }

    if (isEnabled('linkTool')) {
      tools.linkTool = { class: LinkTool, config: getConfig('linkTool', {}) };
    }

    if (isEnabled('attaches')) {
      tools.attaches = { class: Attaches, config: getConfig('attaches', { ...uploadConfig }) };
    }

    if (isEnabled('embed')) {
      tools.embed = { class: Embed, inlineToolbar: true };
    }

    // Table
    if (isEnabled('table')) {
      tools.table = { class: Table, inlineToolbar: true, config: getConfig('table', { rows: 3, cols: 3, withHeadings: true }) };
    }

    // Code
    if (isEnabled('code')) {
      tools.code = { class: CodeFlask };
    }

    if (isEnabled('raw')) {
      tools.raw = { class: RawTool, config: getConfig('raw', { placeholder: 'Enter raw HTML' }) };
    }

    // Layout
    if (isEnabled('columns')) {
      tools.columns = {
        class: editorjsColumns,
        config: { EditorJsLibrary: EditorJS, tools: {} },
      };
    }

    // Custom tools
    if (isEnabled('video')) {
      tools.video = { class: VideoTool, config: getConfig('video', uploadConfig) };
    }

    if (isEnabled('audio')) {
      tools.audio = { class: AudioTool, config: getConfig('audio', uploadConfig) };
    }

    if (isEnabled('gallery')) {
      tools.gallery = { class: GalleryTool, config: getConfig('gallery', uploadConfig) };
    }

    if (isEnabled('tabs')) {
      tools.tabs = { class: TabsTool };
    }

    if (isEnabled('math')) {
      tools.math = { class: MathTool };
    }

    if (isEnabled('mermaid')) {
      tools.mermaid = { class: MermaidTool };
    }

    if (isEnabled('drawing')) {
      tools.drawing = { class: DrawingTool };
    }

    if (isEnabled('iframe')) {
      tools.iframe = { class: IframeTool };
    }

    if (isEnabled('map')) {
      tools.map = { class: MapTool };
    }

    if (isEnabled('socialEmbed')) {
      tools.socialEmbed = { class: SocialEmbedTool };
    }

    if (isEnabled('pageBreak')) {
      tools.pageBreak = { class: PageBreakTool };
    }

    if (isEnabled('qrcode')) {
      tools.qrcode = { class: QRCodeTool };
    }

    if (isEnabled('signature')) {
      tools.signature = { class: SignatureTool };
    }

    if (isEnabled('chart')) {
      tools.chart = { class: ChartTool };
    }

    // Inline tools
    if (isEnabled('marker')) {
      tools.marker = { class: Marker };
    }

    if (isEnabled('inlineCode')) {
      tools.inlineCode = { class: InlineCode };
    }

    if (isEnabled('underline')) {
      tools.underline = { class: Underline };
    }

    if (isEnabled('hyperlink')) {
      tools.hyperlink = {
        class: HyperlinkTool,
        config: getConfig('hyperlink', { availableTargets: ['_self', '_blank'], availableRels: ['', 'nofollow', 'noreferrer'] }),
      };
    }

    if (isEnabled('Color')) {
      tools.Color = {
        class: TextColorTool,
        config: getConfig('Color', { type: 'text' }),
      };
    }

    if (isEnabled('highlightColor')) {
      tools.highlightColor = {
        class: TextColorTool,
        config: getConfig('highlightColor', { type: 'background' }),
      };
    }

    if (isEnabled('changeCase')) {
      tools.changeCase = { class: ChangeCase };
    }

    if (isEnabled('tooltip')) {
      tools.tooltip = {
        class: Tooltip,
        config: getConfig('tooltip', { location: 'bottom', underline: true, placeholder: 'Enter a tooltip' }),
      };
    }

    // Block tunes
    tools.textVariant = { class: TextVariantTune };
    tools.alignmentTune = {
      class: AlignmentTune,
      config: { default: 'left' },
    };
    tools.blockActions = {
      class: BlockActionsTune,
    };

    return tools;
  }

  // ============================================================
  // Upload config
  // ============================================================

  private _buildUploadConfig(): any {
    if (this.config.uploadAdapter) {
      const adapter = this.config.uploadAdapter;
      return {
        uploader: {
          uploadByFile: async (file: File) => {
            const res = await adapter.uploadByFile(file);
            this._trackUploadedMedia(res, file.type);
            return res;
          },
          uploadByUrl: adapter.uploadByUrl
            ? async (url: string) => {
                const res = await adapter.uploadByUrl!(url);
                this._trackUploadedMedia(res);
                return res;
              }
            : undefined,
        },
      };
    }

    if (this.config.uploadEndpoint) {
      return {
        endpoints: {
          byFile: this.config.uploadEndpoint,
          byUrl: this.config.uploadEndpoint,
        },
      };
    }

    return {};
  }

  private _trackUploadedMedia(res: { success: boolean; file: { url: string; name?: string; [key: string]: unknown } }, mimeType?: string): void {
    if (!res?.success || !res.file?.url) return;
    let type: MediaItem['type'] = 'file';
    if (mimeType?.startsWith('image/')) type = 'image';
    else if (mimeType?.startsWith('video/')) type = 'video';
    else if (mimeType?.startsWith('audio/')) type = 'audio';
    this.recentMedia.unshift({ url: res.file.url, name: res.file.name, type });
    this.recentMedia = this.recentMedia.slice(0, 50);
  }

  // ============================================================
  // i18n
  // ============================================================

  private _buildI18n(): any {
    if (!this.config.locale) return {};

    if (typeof this.config.locale === 'string') {
      const messages = LOCALES[this.config.locale];
      if (messages) return { messages };
    } else {
      return { messages: (this.config.locale as LocaleConfig).messages };
    }

    return {};
  }

  // ============================================================
  // Theme
  // ============================================================

  private _applyTheme(theme: string | ThemeConfig): void {
    if (!this.wrapperElement) return;

    // Remove existing theme classes
    this.wrapperElement.classList.remove('be-editor--dark', 'be-editor--minimal');

    if (typeof theme === 'string') {
      if (theme === 'dark') this.wrapperElement.classList.add('be-editor--dark');
      if (theme === 'minimal') this.wrapperElement.classList.add('be-editor--minimal');
    } else {
      // Custom theme via CSS variables
      Object.entries(theme.variables).forEach(([key, value]) => {
        this.wrapperElement!.style.setProperty(key, value);
      });
      if (theme.css) {
        const style = document.createElement('style');
        style.textContent = theme.css;
        document.head.appendChild(style);
      }
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Save editor content and return JSON data
   */
  async save(): Promise<OutputData> {
    if (!this.editor) throw new Error('Editor not initialized');
    const data = await this.editor.save();
    this.lastSavedSnapshot = data;
    this._emit('save', data);
    return data;
  }

  /**
   * Save the editor content and diff every media block (image, gallery,
   * video, audio, attaches) against the last *committed* baseline — see
   * `commitMediaBaseline()`. `mediaChanges` entries are
   * `{ blockId, blockType, changeType: 'added'|'removed'|'modified', old, new }`.
   *
   * The baseline only advances when you call `commitMediaBaseline()` — so if
   * a block's image is swapped 3 times before ever being saved, `old` still
   * points at the originally-saved file, not an intermediate unsaved one;
   * and if your backend save fails, skip the commit and the next diff will
   * still be correct.
   */
  async saveWithMediaChanges(): Promise<{ data: OutputData; mediaChanges: MediaChange[] }> {
    const data = await this.save();
    if (this.config.trackMedia?.enabled === false) {
      return { data, mediaChanges: [] };
    }
    const mediaChanges = diffMediaChanges(this.mediaBaseline, data, {
      blockTypes: this.config.trackMedia?.blockTypes,
    });
    return { data, mediaChanges };
  }

  /**
   * Advance the "confirmed saved" baseline used by `saveWithMediaChanges()`.
   * Call this ONLY after your backend has confirmed the save succeeded —
   * e.g. after a 200 response — never optimistically, so a failed save
   * doesn't cause the next diff to silently miss a change.
   *
   * Defaults to the data from the most recent `save()`/`saveWithMediaChanges()` call.
   */
  commitMediaBaseline(data?: OutputData): void {
    const next = data ?? this.lastSavedSnapshot;
    if (next) this.mediaBaseline = next;
  }

  /**
   * Render data into the editor
   */
  async render(data: OutputData): Promise<void> {
    if (!this.editor) throw new Error('Editor not initialized');
    await this.editor.render(data);
  }

  /**
   * Clear editor content
   */
  async clear(): Promise<void> {
    if (!this.editor) throw new Error('Editor not initialized');
    await this.editor.clear();
  }

  /**
   * Destroy editor instance
   */
  destroy(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    if (this.hoverActions) {
      this.hoverActions.destroy();
      this.hoverActions = null;
    }
    if (this.topToolbar) {
      this.topToolbar.destroy();
      this.topToolbar = null;
    }
    if (this.findReplace) {
      this.findReplace.detach();
      this.findReplace = null;
    }
    if (this.inlineToolbarClamp) {
      this.inlineToolbarClamp.detach();
      this.inlineToolbarClamp = null;
    }
    if (this.toc) {
      this.toc.detach();
      this.toc = null;
    }
    if (this.mediaLibrary) {
      this.mediaLibrary.close();
      this.mediaLibrary = null;
    }
    if (this.emojiPicker) {
      this.emojiPicker.close();
      this.emojiPicker = null;
    }
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    if (this.wrapperElement) {
      this.wrapperElement.remove();
      this.wrapperElement = null;
    }
    this.events.clear();
  }

  /**
   * Toggle read-only mode
   */
  async toggleReadOnly(): Promise<boolean> {
    if (!this.editor) throw new Error('Editor not initialized');
    const state = await this.editor.readOnly.toggle();
    return state;
  }

  /**
   * Open the Find & Replace panel (Ctrl+F)
   */
  openFindReplace(): void {
    this.findReplace?.open();
  }

  /**
   * Open the Media Library picker
   */
  openMediaLibrary(): void {
    this.mediaLibrary?.open();
  }

  /**
   * Toggle the floating Table of Contents outline panel
   */
  toggleTableOfContents(open?: boolean): void {
    this.toc?.toggle(open);
  }

  /**
   * Check if editor is in read-only mode
   */
  get isReadOnly(): boolean {
    return this.editor?.readOnly?.isEnabled || false;
  }

  /**
   * Export editor content as HTML
   */
  async toHTML(): Promise<string> {
    const data = await this.save();
    return renderToHTML(data);
  }

  /**
   * Export editor content as Markdown
   */
  async toMarkdown(): Promise<string> {
    const data = await this.save();
    return renderToMarkdown(data);
  }

  /**
   * Export editor content as JSON
   */
  async toJSON(): Promise<OutputData> {
    return this.save();
  }

  /**
   * Set editor theme
   */
  setTheme(theme: 'default' | 'dark' | 'minimal' | ThemeConfig): void {
    this._applyTheme(theme);
  }

  /**
   * Get the underlying EditorJS instance
   */
  get instance(): EditorJS | null {
    return this.editor;
  }

  // ============================================================
  // Events
  // ============================================================

  on(event: EditorEventType | string, callback: EditorEventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: EditorEventType | string, callback: EditorEventCallback): void {
    this.events.get(event)?.delete(callback);
  }

  private _emit(event: string, ...args: unknown[]): void {
    this.events.get(event)?.forEach(cb => cb(...args));
  }
}
