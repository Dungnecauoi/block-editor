/**
 * TableOfContents — Floating outline panel auto-built from heading blocks
 */
import { slugify } from '../../utils/slugify';

interface TocEntry {
  level: number;
  text: string;
  el: HTMLElement;
}

export class TableOfContents {
  private container: HTMLElement;
  private contentRoot: HTMLElement;
  private fab: HTMLButtonElement | null = null;
  private panel: HTMLElement | null = null;
  private listEl: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private rafId: number | null = null;
  private isOpen = false;

  /**
   * @param container Wrapper element to attach the FAB/panel to (for theme scoping)
   * @param contentRoot The editor's content root to watch for headings — must NOT
   *                     contain the panel itself, or mutations from re-rendering the
   *                     panel would re-trigger the observer in an infinite loop.
   */
  constructor(container: HTMLElement, contentRoot: HTMLElement) {
    this.container = container;
    this.contentRoot = contentRoot;
  }

  attach(): void {
    this.fab = document.createElement('button');
    this.fab.type = 'button';
    this.fab.className = 'be-toc-fab';
    this.fab.title = 'Table of Contents';
    this.fab.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';
    this.fab.addEventListener('click', () => this.toggle());

    this.panel = document.createElement('div');
    this.panel.className = 'be-toc-panel';
    this.panel.innerHTML = '<div class="be-toc-panel__title">Outline</div><div class="be-toc-panel__list"></div>';
    this.listEl = this.panel.querySelector('.be-toc-panel__list');

    this.container.appendChild(this.fab);
    this.container.appendChild(this.panel);

    this.observer = new MutationObserver(() => this._scheduleRefresh());
    this.observer.observe(this.contentRoot, { childList: true, subtree: true, characterData: true });

    this._refresh();
  }

  detach(): void {
    this.observer?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.fab?.remove();
    this.panel?.remove();
    this.fab = null;
    this.panel = null;
    this.listEl = null;
  }

  toggle(open?: boolean): void {
    this.isOpen = open ?? !this.isOpen;
    this.panel?.classList.toggle('be-toc-panel--open', this.isOpen);
  }

  private _scheduleRefresh(): void {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this._refresh();
    });
  }

  private _refresh(): void {
    if (!this.listEl) return;
    const headers = Array.from(this.contentRoot.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'));

    const usedSlugs = new Set<string>();
    const entries: TocEntry[] = headers.map((el) => {
      const text = el.textContent || '';
      const id = slugify(text, usedSlugs);
      el.id = id;
      return { level: parseInt(el.tagName.substring(1), 10), text, el };
    });

    if (!entries.length) {
      this.listEl.innerHTML = '<div class="be-toc-panel__empty">No headings yet</div>';
      return;
    }

    const minLevel = Math.min(...entries.map((e) => e.level));
    this.listEl.innerHTML = '';
    entries.forEach((entry) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'be-toc-panel__item';
      item.style.paddingLeft = `${(entry.level - minLevel) * 14 + 10}px`;
      item.textContent = entry.text || '(untitled)';
      item.addEventListener('click', () => {
        entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        entry.el.classList.add('be-toc-highlight');
        setTimeout(() => entry.el.classList.remove('be-toc-highlight'), 1200);
      });
      this.listEl!.appendChild(item);
    });
  }
}
