/**
 * TopToolbar — Sticky enterprise quick action bar for @duxbo/block-editor
 * Provides convenient, large, easy-to-click buttons for all common editing actions:
 * Formatting, Block Conversions, Quick Inserts, Alignment, History, and Live Stats.
 */
import type EditorJS from '@editorjs/editorjs';

export interface TopToolbarConfig {
  showHistory?: boolean;
  showHeadings?: boolean;
  showFormatting?: boolean;
  showAlignment?: boolean;
  showLists?: boolean;
  showInsertMenu?: boolean;
  showBlockActions?: boolean;
  showStats?: boolean;
  showFullscreen?: boolean;
}

export class TopToolbar {
  private editor: EditorJS;
  private container: HTMLElement;
  private config: TopToolbarConfig;
  private wordsCountEl: HTMLElement | null = null;
  private charsCountEl: HTMLElement | null = null;
  private isFullscreen = false;

  constructor(editor: EditorJS, container: HTMLElement, config?: TopToolbarConfig) {
    this.editor = editor;
    this.container = container;
    this.config = {
      showHistory: true,
      showHeadings: true,
      showFormatting: true,
      showAlignment: true,
      showLists: true,
      showInsertMenu: true,
      showBlockActions: true,
      showStats: true,
      showFullscreen: true,
      ...config,
    };

    this.render();
    this.attachListeners();
  }

  private render(): void {
    const bar = document.createElement('div');
    bar.className = 'be-top-toolbar';

    bar.innerHTML = `
      <div class="be-top-toolbar__scroll">
        <!-- History -->
        ${this.config.showHistory ? `
          <div class="be-toolbar-group">
            <button type="button" class="be-tbar-btn" data-action="undo" title="Undo (Hoàn tác - Ctrl+Z)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
            </button>
            <button type="button" class="be-tbar-btn" data-action="redo" title="Redo (Làm lại - Ctrl+Y)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
            </button>
          </div>
          <div class="be-toolbar-divider"></div>
        ` : ''}

        <!-- Block Type Selector -->
        ${this.config.showHeadings ? `
          <div class="be-toolbar-group">
            <select class="be-tbar-select" data-action="block-type" title="Block Type (Kiểu khối)">
              <option value="paragraph">Paragraph (Văn bản)</option>
              <option value="h1">Heading 1 (Tiêu đề 1)</option>
              <option value="h2">Heading 2 (Tiêu đề 2)</option>
              <option value="h3">Heading 3 (Tiêu đề 3)</option>
              <option value="quote">Quote (Trích dẫn)</option>
              <option value="alert">Alert (Cảnh báo)</option>
              <option value="code">Code (Mã nguồn)</option>
            </select>
          </div>
          <div class="be-toolbar-divider"></div>
        ` : ''}

        <!-- Inline Formatting -->
        ${this.config.showFormatting ? `
          <div class="be-toolbar-group">
            <button type="button" class="be-tbar-btn" data-action="bold" title="Bold (Đậm - Ctrl+B)">
              <strong style="font-size: 15px;">B</strong>
            </button>
            <button type="button" class="be-tbar-btn" data-action="italic" title="Italic (Nghiêng - Ctrl+I)">
              <em style="font-size: 15px; font-family: serif;">I</em>
            </button>
            <button type="button" class="be-tbar-btn" data-action="underline" title="Underline (Gạch chân - Ctrl+U)">
              <u style="font-size: 15px;">U</u>
            </button>
            <button type="button" class="be-tbar-btn" data-action="strike" title="Strikethrough (Gạch ngang)">
              <s style="font-size: 15px;">S</s>
            </button>
            <button type="button" class="be-tbar-btn" data-action="highlight" title="Highlight (Đánh dấu màu)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11-6 6v3h3l6-6"></path><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path></svg>
            </button>
            <button type="button" class="be-tbar-btn" data-action="clear-format" title="Clear Formatting (Xoá định dạng)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
            </button>
          </div>
          <div class="be-toolbar-divider"></div>
        ` : ''}

        <!-- Lists -->
        ${this.config.showLists ? `
          <div class="be-toolbar-group">
            <button type="button" class="be-tbar-btn" data-action="bullet-list" title="Bullet List (Danh sách chấm)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="4" cy="6" r="2"></circle><circle cx="4" cy="12" r="2"></circle><circle cx="4" cy="18" r="2"></circle></svg>
            </button>
            <button type="button" class="be-tbar-btn" data-action="number-list" title="Numbered List (Danh sách số)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
            </button>
            <button type="button" class="be-tbar-btn" data-action="checklist" title="Checklist (Danh sách công việc)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </button>
          </div>
          <div class="be-toolbar-divider"></div>
        ` : ''}

        <!-- Quick Insert Items -->
        ${this.config.showInsertMenu ? `
          <div class="be-toolbar-group">
            <button type="button" class="be-tbar-btn be-tbar-btn--insert" data-action="insert-image" title="Insert Image (Chèn ảnh)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>Image</span>
            </button>
            <button type="button" class="be-tbar-btn be-tbar-btn--insert" data-action="insert-video" title="Insert Video (Chèn video)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              <span>Video</span>
            </button>
            <button type="button" class="be-tbar-btn be-tbar-btn--insert" data-action="insert-table" title="Insert Table (Chèn bảng)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>
              <span>Table</span>
            </button>
            <button type="button" class="be-tbar-btn be-tbar-btn--insert" data-action="insert-tabs" title="Insert Tabs (Chèn tabs)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"></path><line x1="4" y1="11" x2="20" y2="11"></line><line x1="9" y1="6" x2="9" y2="11"></line></svg>
              <span>Tabs</span>
            </button>
            <button type="button" class="be-tbar-btn be-tbar-btn--insert" data-action="insert-columns" title="Insert Columns (Chia cột)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="18" rx="1"></rect><rect x="13" y="3" width="8" height="18" rx="1"></rect></svg>
              <span>Columns</span>
            </button>
            <button type="button" class="be-tbar-btn be-tbar-btn--insert" data-action="insert-delimiter" title="Insert Divider (Đường kẻ ngang)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line></svg>
              <span>Divider</span>
            </button>
          </div>
          <div class="be-toolbar-divider"></div>
        ` : ''}

        <!-- Block Actions -->
        ${this.config.showBlockActions ? `
          <div class="be-toolbar-group">
            <button type="button" class="be-tbar-btn" data-action="duplicate-current" title="Duplicate Current Block (Nhân bản khối hiện tại)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span class="be-tbar-btn-text">Duplicate</span>
            </button>
            <button type="button" class="be-tbar-btn be-tbar-btn--danger" data-action="delete-current" title="Delete Current Block (Xoá khối hiện tại)">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span class="be-tbar-btn-text">Delete</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Right Actions: Stats & Fullscreen -->
      <div class="be-top-toolbar__right">
        ${this.config.showStats ? `
          <div class="be-tbar-stats">
            <span class="be-tbar-stat"><strong id="be-words-count">0</strong> words</span>
            <span class="be-tbar-stat-dot">•</span>
            <span class="be-tbar-stat"><strong id="be-chars-count">0</strong> chars</span>
          </div>
        ` : ''}

        ${this.config.showFullscreen ? `
          <button type="button" class="be-tbar-btn be-tbar-btn--icon-only" data-action="toggle-fullscreen" title="Toggle Fullscreen (Toàn màn hình)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          </button>
        ` : ''}
      </div>
    `;

    this.container.insertBefore(bar, this.container.firstChild);

    this.wordsCountEl = bar.querySelector('#be-words-count');
    this.charsCountEl = bar.querySelector('#be-chars-count');
  }

  private attachListeners(): void {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.be-tbar-btn') as HTMLElement;
      if (!btn) return;

      const action = btn.dataset.action;
      if (!action) return;

      this.executeAction(action);
    });

    const blockTypeSelect = this.container.querySelector('.be-tbar-select[data-action="block-type"]') as HTMLSelectElement;
    if (blockTypeSelect) {
      blockTypeSelect.addEventListener('change', () => {
        this.convertCurrentBlock(blockTypeSelect.value);
      });
    }

    // Update stats on change
    setInterval(() => {
      this.updateStats();
    }, 1200);
  }

  private executeAction(action: string): void {
    switch (action) {
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'strike':
        document.execCommand('strikeThrough');
        break;
      case 'highlight':
        document.execCommand('hiliteColor', false, '#fef08a');
        break;
      case 'clear-format':
        document.execCommand('removeFormat');
        break;
      case 'bullet-list':
        this.insertBlock('list', { style: 'unordered', items: [{ content: 'New item', items: [] }] });
        break;
      case 'number-list':
        this.insertBlock('list', { style: 'ordered', items: [{ content: 'New item', items: [] }] });
        break;
      case 'checklist':
        this.insertBlock('checklist', { items: [{ text: 'Task item', checked: false }] });
        break;
      case 'insert-image':
        this.insertBlock('image', {});
        break;
      case 'insert-video':
        this.insertBlock('video', {});
        break;
      case 'insert-table':
        this.insertBlock('table', { rows: 3, cols: 3, withHeadings: true });
        break;
      case 'insert-tabs':
        this.insertBlock('tabs', {});
        break;
      case 'insert-columns':
        this.insertBlock('columns', {});
        break;
      case 'insert-delimiter':
        this.insertBlock('delimiter', {});
        break;
      case 'duplicate-current':
        this.duplicateCurrentBlock();
        break;
      case 'delete-current':
        this.deleteCurrentBlock();
        break;
      case 'toggle-fullscreen':
        this.toggleFullscreen();
        break;
    }
  }

  private insertBlock(type: string, data: any): void {
    try {
      const currentIndex = this.editor.blocks.getCurrentBlockIndex();
      const insertAt = currentIndex >= 0 ? currentIndex + 1 : this.editor.blocks.getBlocksCount();
      this.editor.blocks.insert(type, data, {}, insertAt, true);
    } catch (err) {
      console.warn('Failed to insert block:', err);
    }
  }

  private async duplicateCurrentBlock(): Promise<void> {
    try {
      const currentIndex = this.editor.blocks.getCurrentBlockIndex();
      if (currentIndex < 0) return;
      const block = (this.editor.blocks as any).getBlockByIndex(currentIndex);
      if (!block) return;
      const data = await block.save();
      this.editor.blocks.insert(block.name, data.data, data.config, currentIndex + 1, true);
    } catch (err) {
      console.warn('Failed to duplicate block:', err);
    }
  }

  private deleteCurrentBlock(): void {
    try {
      const currentIndex = this.editor.blocks.getCurrentBlockIndex();
      if (currentIndex < 0) return;
      this.editor.blocks.delete(currentIndex);
    } catch (err) {
      console.warn('Failed to delete block:', err);
    }
  }

  private async convertCurrentBlock(targetType: string): Promise<void> {
    try {
      const currentIndex = this.editor.blocks.getCurrentBlockIndex();
      if (currentIndex < 0) return;
      const block = (this.editor.blocks as any).getBlockByIndex(currentIndex);
      if (!block) return;
      const saved = await block.save();

      let text = '';
      if (saved?.data && typeof saved.data === 'object') {
        text = (saved.data as any).text || '';
      }

      let newType = 'paragraph';
      let newData: any = { text };

      if (targetType.startsWith('h')) {
        newType = 'header';
        newData = { text, level: parseInt(targetType.replace('h', ''), 10) || 2 };
      } else if (targetType === 'quote') {
        newType = 'quote';
        newData = { text, caption: '' };
      } else if (targetType === 'alert') {
        newType = 'alert';
        newData = { message: text, type: 'primary' };
      } else if (targetType === 'code') {
        newType = 'code';
        newData = { code: text };
      }

      this.editor.blocks.delete(currentIndex);
      this.editor.blocks.insert(newType, newData, {}, currentIndex, true);
    } catch (err) {
      console.warn('Failed to convert block:', err);
    }
  }

  private toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    const root = this.container.closest('.be-editor') || this.container;
    root.classList.toggle('be-editor--fullscreen', this.isFullscreen);
  }

  private async updateStats(): Promise<void> {
    if (!this.wordsCountEl || !this.charsCountEl) return;
    try {
      const text = this.container.innerText || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      this.wordsCountEl.textContent = words.toLocaleString();
      this.charsCountEl.textContent = chars.toLocaleString();
    } catch {}
  }
}
