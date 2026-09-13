/**
 * BlockActionsTune — Enterprise block actions tune for @duxbo/block-editor
 * Adds Duplicate, Insert Above, Insert Below, Copy, and Delete actions to block settings
 */
import type { API, BlockAPI } from '@editorjs/editorjs';

export interface BlockActionsTuneConfig {
  enableDuplicate?: boolean;
  enableMove?: boolean;
  enableInsert?: boolean;
  enableCopy?: boolean;
  enableDelete?: boolean;
}

export default class BlockActionsTune {
  private api: API;
  private block: BlockAPI;
  private config: BlockActionsTuneConfig;

  static get isTune(): boolean {
    return true;
  }

  constructor({
    api,
    block,
    config,
  }: {
    api: API;
    block: BlockAPI;
    config?: BlockActionsTuneConfig;
  }) {
    this.api = api;
    this.block = block;
    this.config = {
      enableDuplicate: true,
      enableMove: true,
      enableInsert: true,
      enableCopy: true,
      enableDelete: true,
      ...config,
    };
  }

  /**
   * Return popover items for Editor.js 2.26+
   */
  render(): any {
    const items = [];

    // Duplicate
    if (this.config.enableDuplicate) {
      items.push({
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
        title: this.api.i18n.t('Duplicate block') || 'Duplicate',
        name: 'duplicate',
        closeOnActivate: true,
        onActivate: async () => {
          await this.duplicateBlock();
        },
      });
    }

    // Insert above
    if (this.config.enableInsert) {
      items.push({
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="18 4 12 1 6 4"></polyline></svg>`,
        title: this.api.i18n.t('Add block above') || 'Insert above',
        name: 'insert-above',
        closeOnActivate: true,
        onActivate: () => {
          const index = this.api.blocks.getBlockIndex(this.block.id);
          this.api.blocks.insert('paragraph', {}, {}, Math.max(0, index), true);
        },
      });

      items.push({
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="18 20 12 23 6 20"></polyline></svg>`,
        title: this.api.i18n.t('Add block below') || 'Insert below',
        name: 'insert-below',
        closeOnActivate: true,
        onActivate: () => {
          const index = this.api.blocks.getBlockIndex(this.block.id);
          this.api.blocks.insert('paragraph', {}, {}, index + 1, true);
        },
      });
    }

    // Copy content
    if (this.config.enableCopy) {
      items.push({
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
        title: this.api.i18n.t('Copy block') || 'Copy block',
        name: 'copy',
        closeOnActivate: true,
        onActivate: async () => {
          await this.copyBlock();
        },
      });
    }

    // Direct 1-click Delete
    if (this.config.enableDelete) {
      items.push({
        icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
        title: this.api.i18n.t('Delete block') || 'Delete',
        name: 'delete-direct',
        closeOnActivate: true,
        onActivate: () => {
          const index = this.api.blocks.getBlockIndex(this.block.id);
          this.api.blocks.delete(index);
        },
      });
    }

    return items;
  }

  /**
   * Duplicates the current block with all its saved data
   */
  public async duplicateBlock(): Promise<void> {
    const index = this.api.blocks.getBlockIndex(this.block.id);
    const savedData = await this.block.save();
    if (!savedData) return;

    this.api.blocks.insert(
      this.block.name,
      savedData.data,
      (savedData as any).config || {},
      index + 1,
      true,
    );
  }

  /**
   * Copies block content to clipboard
   */
  public async copyBlock(): Promise<void> {
    const savedData = await this.block.save();
    if (!savedData) return;

    let textContent = '';
    if (typeof savedData.data === 'object' && savedData.data !== null) {
      if ('text' in savedData.data) {
        textContent = (savedData.data as any).text.replace(/<[^>]+>/g, '');
      } else {
        textContent = JSON.stringify(savedData.data, null, 2);
      }
    }

    try {
      await navigator.clipboard.writeText(textContent);
      this.showToast('Copied to clipboard!');
    } catch {
      // Fallback
    }
  }

  private showToast(msg: string): void {
    const toast = document.createElement('div');
    toast.className = 'be-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('be-toast--visible'), 10);
    setTimeout(() => {
      toast.classList.remove('be-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  save() {
    return {};
  }
}
