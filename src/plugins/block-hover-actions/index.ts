/**
 * BlockHoverActions — Floating 1-click action bar on hovered block
 * Provides immediate, large, easy-to-click block actions:
 * [+ Add below] [Duplicate] [Move Up] [Move Down] [Copy] [Delete]
 */
import type EditorJS from '@editorjs/editorjs';

export class BlockHoverActions {
  private editor: EditorJS;
  private holder: HTMLElement;
  private toolbar: HTMLElement;
  private currentBlockElement: HTMLElement | null = null;
  private hideTimeout: any = null;

  constructor(editor: EditorJS, holder: HTMLElement) {
    this.editor = editor;
    this.holder = holder;
    this.toolbar = this.createToolbar();
    this.holder.appendChild(this.toolbar);
    this.attachEvents();
  }

  private createToolbar(): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'be-block-actions-bar';
    bar.innerHTML = `
      <button type="button" class="be-block-action-btn be-block-action-btn--add" title="Add block below (Thêm khối)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      <button type="button" class="be-block-action-btn be-block-action-btn--duplicate" title="Duplicate block (Nhân bản)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button type="button" class="be-block-action-btn be-block-action-btn--up" title="Move up (Lên)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
      </button>
      <button type="button" class="be-block-action-btn be-block-action-btn--down" title="Move down (Xuống)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
      </button>
      <button type="button" class="be-block-action-btn be-block-action-btn--copy" title="Copy text (Sao chép)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
      </button>
      <button type="button" class="be-block-action-btn be-block-action-btn--delete" title="Delete block (Xóa)">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;

    // Action handlers
    bar.querySelector('.be-block-action-btn--add')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleInsertBelow();
    });

    bar.querySelector('.be-block-action-btn--duplicate')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleDuplicate();
    });

    bar.querySelector('.be-block-action-btn--up')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleMoveUp();
    });

    bar.querySelector('.be-block-action-btn--down')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleMoveDown();
    });

    bar.querySelector('.be-block-action-btn--copy')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleCopy();
    });

    bar.querySelector('.be-block-action-btn--delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleDelete();
    });

    // Prevent bar from hiding when hovering over it
    bar.addEventListener('mouseenter', () => {
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
    });

    bar.addEventListener('mouseleave', () => {
      this.scheduleHide();
    });

    return bar;
  }

  private attachEvents(): void {
    // Mouse over blocks
    this.holder.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const blockEl = target.closest('.ce-block') as HTMLElement;

      if (blockEl && blockEl !== this.currentBlockElement) {
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.currentBlockElement = blockEl;
        this.positionToolbar(blockEl);
      }
    });

    this.holder.addEventListener('mouseleave', () => {
      this.scheduleHide();
    });
  }

  private positionToolbar(blockEl: HTMLElement): void {
    const holderRect = this.holder.getBoundingClientRect();
    const blockRect = blockEl.getBoundingClientRect();
    const toolbarHeight = this.toolbar.offsetHeight || 40;
    const gap = 6;

    // Float just above the block, out of the way of its own first line —
    // this editor's blocks run full-width, so anchoring at the block's own
    // top edge (the old behavior) sat the bar directly on top of wrapped
    // text near the right edge, blocking clicks and hiding content. Only
    // fall back to overlapping the corner when there's no room above (the
    // very first block).
    const aboveTop = blockRect.top - holderRect.top - toolbarHeight - gap;
    const inlineTop = blockRect.top - holderRect.top + 4;
    const top = aboveTop >= 0 ? aboveTop : inlineTop;
    const right = 24;

    this.toolbar.style.top = `${top}px`;
    this.toolbar.style.right = `${right}px`;
    this.toolbar.classList.add('be-block-actions-bar--visible');
  }

  private scheduleHide(): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.toolbar.classList.remove('be-block-actions-bar--visible');
      this.currentBlockElement = null;
    }, 400);
  }

  private getBlockIndex(): number {
    if (!this.currentBlockElement) return -1;
    const blocks = Array.from(this.holder.querySelectorAll('.ce-block'));
    return blocks.indexOf(this.currentBlockElement);
  }

  private async handleDuplicate(): Promise<void> {
    const index = this.getBlockIndex();
    if (index === -1) return;

    try {
      const blockApi = (this.editor.blocks as any).getBlockByIndex(index);
      if (!blockApi) return;
      const data = await blockApi.save();
      this.editor.blocks.insert(blockApi.name, data.data, data.config, index + 1, true);
      this.scheduleHide();
    } catch (err) {
      console.error('Failed to duplicate block:', err);
    }
  }

  private handleInsertBelow(): void {
    const index = this.getBlockIndex();
    if (index === -1) return;
    this.editor.blocks.insert('paragraph', {}, {}, index + 1, true);
    this.scheduleHide();
  }

  private handleMoveUp(): void {
    const index = this.getBlockIndex();
    if (index <= 0) return;
    (this.editor.blocks as any).move(index - 1, index);
  }

  private handleMoveDown(): void {
    const index = this.getBlockIndex();
    const count = this.editor.blocks.getBlocksCount();
    if (index < 0 || index >= count - 1) return;
    (this.editor.blocks as any).move(index + 1, index);
  }

  private async handleCopy(): Promise<void> {
    const index = this.getBlockIndex();
    if (index === -1) return;
    const blockApi = (this.editor.blocks as any).getBlockByIndex(index);
    if (!blockApi) return;
    const data = await blockApi.save();
    let text = '';
    if (data?.data && typeof data.data === 'object') {
      text = (data.data as any).text?.replace(/<[^>]+>/g, '') || JSON.stringify(data.data);
    }
    await navigator.clipboard.writeText(text);
    this.showToast('Copied block text!');
  }

  private handleDelete(): void {
    const index = this.getBlockIndex();
    if (index === -1) return;
    this.editor.blocks.delete(index);
    this.scheduleHide();
  }

  private showToast(msg: string): void {
    const toast = document.createElement('div');
    toast.className = 'be-toast be-toast--visible';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('be-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 1800);
  }

  public destroy(): void {
    this.toolbar.remove();
  }
}
