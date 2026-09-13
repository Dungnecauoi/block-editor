/**
 * EmojiPicker — Popover grid to insert an emoji at the current caret position
 */
import { EMOJI_LIST } from './emoji-data';

export class EmojiPicker {
  private container: HTMLElement;
  private popover: HTMLElement | null = null;
  private gridEl: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private outsideClickHandler: (e: MouseEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.outsideClickHandler = (e: MouseEvent) => {
      if (!this.popover) return;
      const target = e.target as Node;
      if (!this.popover.contains(target) && !this.triggerEl?.contains(target)) {
        this.close();
      }
    };
  }

  private triggerEl: HTMLElement | null = null;

  attach(triggerEl: HTMLElement): void {
    this.triggerEl = triggerEl;
    // Prevent the trigger from stealing focus so the caret stays in the editor
    triggerEl.addEventListener('mousedown', (e) => e.preventDefault());
    triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
  }

  toggle(): void {
    if (this.popover) this.close();
    else this.open();
  }

  private open(): void {
    this.popover = document.createElement('div');
    this.popover.className = 'be-emoji-picker';

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Search emoji...';
    this.searchInput.className = 'be-emoji-picker__search';
    this.searchInput.addEventListener('mousedown', (e) => e.stopPropagation());
    this.searchInput.addEventListener('input', () => this._renderGrid(this.searchInput!.value));

    this.gridEl = document.createElement('div');
    this.gridEl.className = 'be-emoji-picker__grid';

    this.popover.appendChild(this.searchInput);
    this.popover.appendChild(this.gridEl);
    this.container.appendChild(this.popover);

    this._renderGrid('');
    document.addEventListener('click', this.outsideClickHandler);
  }

  close(): void {
    this.popover?.remove();
    this.popover = null;
    this.gridEl = null;
    this.searchInput = null;
    document.removeEventListener('click', this.outsideClickHandler);
  }

  private _renderGrid(query: string): void {
    if (!this.gridEl) return;
    const q = query.trim().toLowerCase();
    const list = q
      ? EMOJI_LIST.filter((e) => e.keywords.includes(q))
      : EMOJI_LIST;

    this.gridEl.innerHTML = '';
    if (!list.length) {
      this.gridEl.innerHTML = '<div class="be-emoji-picker__empty">No results</div>';
      return;
    }

    list.forEach((entry) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'be-emoji-picker__item';
      btn.textContent = entry.char;
      btn.title = entry.keywords;
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.execCommand('insertText', false, entry.char);
        this.close();
      });
      this.gridEl!.appendChild(btn);
    });
  }
}
