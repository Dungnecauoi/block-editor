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
import Hyperlink from 'editorjs-hyperlink';
// @ts-ignore
import ColorPlugin from 'editorjs-text-color-plugin';
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

// Block tunes
import BlockActionsTune from './tunes/block-actions';

// Plugins & UI
import SlashCommandPlugin from './plugins/slash-command';
import { BlockHoverActions } from './plugins/block-hover-actions';
import { TopToolbar } from './ui/toolbar';

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
import './plugins/slash-command/slash-command.css';

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

  constructor(config: BlockEditorConfig) {
    this.config = {
      enableAll: true,
      enableDragDrop: true,
      enableUndoRedo: true,
      enableSlashCommand: true,
      showToolbar: true,
      showHoverActions: true,
      placeholder: 'Type "/" for commands, or start writing...',
      logLevel: 'ERROR',
      ...config,
    };

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

    // Create EditorJS instance
    this.editor = new EditorJS({
      holder: editorHolder.id,
      data: this.config.data || { blocks: [] },
      placeholder: this.config.placeholder,
      readOnly: this.config.readOnly || false,
      logLevel: this.config.logLevel as any,
      minHeight: this.config.minHeight || 100,
      tools,
      tunes,
      i18n: i18n as any,
      onChange: async () => {
        if (this.config.onChange && this.editor) {
          const data = await this.editor.save();
          this.config.onChange(data);
          this._emit('change', data);
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
        if (this.config.showToolbar !== false && this.editor && this.wrapperElement) {
          this.topToolbar = new TopToolbar(this.editor, this.wrapperElement);
        }
        if (this.config.showHoverActions !== false && this.editor && this.wrapperElement) {
          this.hoverActions = new BlockHoverActions(this.editor, this.wrapperElement);
        }

        this.config.onReady?.();
        this._emit('ready');
      },
    });
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
        class: Hyperlink,
        config: getConfig('hyperlink', { shortcut: 'CMD+L', target: '_blank', rel: 'nofollow', availableTargets: ['_blank', '_self'], availableRels: ['nofollow', 'noreferrer'] }),
      };
    }

    if (isEnabled('Color')) {
      tools.Color = {
        class: ColorPlugin,
        config: getConfig('Color', {
          colorCollections: ['#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF', '#FF9800', '#FF5722', '#795548', '#607D8B', '#000000'],
          defaultColor: '#FF1300', type: 'text', customPicker: true,
        }),
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
      return {
        uploader: {
          uploadByFile: this.config.uploadAdapter.uploadByFile.bind(this.config.uploadAdapter),
          uploadByUrl: this.config.uploadAdapter.uploadByUrl
            ? this.config.uploadAdapter.uploadByUrl.bind(this.config.uploadAdapter)
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
    this._emit('save', data);
    return data;
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
    if (this.hoverActions) {
      this.hoverActions.destroy();
      this.hoverActions = null;
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
