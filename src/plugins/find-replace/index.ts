/**
 * FindReplacePlugin — Ctrl+F find & replace across all editable blocks
 */
export class FindReplacePlugin {
  private container: HTMLElement;
  private panel: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private replaceInput: HTMLInputElement | null = null;
  private counterEl: HTMLElement | null = null;
  private caseCheckbox: HTMLInputElement | null = null;
  private marks: HTMLElement[] = [];
  private activeIndex = -1;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.keydownHandler = (e: KeyboardEvent) => {
      const isFindShortcut = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'f';
      if (isFindShortcut && this.container.contains(document.activeElement)) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.panel) {
        this.close();
      }
    };
  }

  attach(): void {
    this.container.addEventListener('keydown', this.keydownHandler);
  }

  detach(): void {
    this.container.removeEventListener('keydown', this.keydownHandler);
    this.close();
  }

  open(): void {
    if (this.panel) {
      this.searchInput?.focus();
      return;
    }

    this.panel = document.createElement('div');
    this.panel.className = 'be-find-replace';
    this.panel.innerHTML = `
      <div class="be-find-replace__row">
        <input type="text" class="be-find-replace__input" data-role="search" placeholder="Find..." />
        <span class="be-find-replace__counter" data-role="counter">0/0</span>
        <button type="button" class="be-find-replace__icon-btn" data-action="prev" title="Previous (Shift+Enter)">▲</button>
        <button type="button" class="be-find-replace__icon-btn" data-action="next" title="Next (Enter)">▼</button>
        <label class="be-find-replace__case">
          <input type="checkbox" data-role="case" /> Aa
        </label>
        <button type="button" class="be-find-replace__icon-btn be-find-replace__close" data-action="close" title="Close (Esc)">✕</button>
      </div>
      <div class="be-find-replace__row">
        <input type="text" class="be-find-replace__input" data-role="replace" placeholder="Replace with..." />
        <button type="button" class="be-find-replace__btn" data-action="replace">Replace</button>
        <button type="button" class="be-find-replace__btn" data-action="replace-all">Replace All</button>
      </div>
    `;

    this.container.appendChild(this.panel);

    this.searchInput = this.panel.querySelector('[data-role="search"]');
    this.replaceInput = this.panel.querySelector('[data-role="replace"]');
    this.counterEl = this.panel.querySelector('[data-role="counter"]');
    this.caseCheckbox = this.panel.querySelector('[data-role="case"]');

    this.searchInput?.addEventListener('input', () => this._search());
    this.caseCheckbox?.addEventListener('change', () => this._search());

    this.searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._navigate(e.shiftKey ? -1 : 1);
      }
    });

    this.panel.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      switch (btn.dataset.action) {
        case 'prev': this._navigate(-1); break;
        case 'next': this._navigate(1); break;
        case 'replace': this._replaceCurrent(); break;
        case 'replace-all': this._replaceAll(); break;
        case 'close': this.close(); break;
      }
    });

    this.searchInput?.focus();
  }

  close(): void {
    this._clearHighlights();
    this.panel?.remove();
    this.panel = null;
    this.searchInput = null;
    this.replaceInput = null;
    this.counterEl = null;
    this.caseCheckbox = null;
  }

  private _getEditableRoots(): HTMLElement[] {
    return Array.from(this.container.querySelectorAll<HTMLElement>('[contenteditable="true"]'));
  }

  private _clearHighlights(): void {
    this._getEditableRoots().forEach((root) => {
      root.querySelectorAll('mark.be-find-mark').forEach((mark) => {
        const parent = mark.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      });
    });
    this.marks = [];
    this.activeIndex = -1;
  }

  private _search(): void {
    this._clearHighlights();
    const term = this.searchInput?.value || '';
    if (!term) {
      this._updateCounter();
      return;
    }

    const caseSensitive = !!this.caseCheckbox?.checked;
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    this._getEditableRoots().forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) textNodes.push(node as Text);

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        regex.lastIndex = 0;
        if (!regex.test(text)) return;
        regex.lastIndex = 0;

        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text))) {
          if (match.index > lastIndex) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }
          const mark = document.createElement('mark');
          mark.className = 'be-find-mark';
          mark.textContent = match[0];
          frag.appendChild(mark);
          this.marks.push(mark);
          lastIndex = match.index + match[0].length;
          if (match[0].length === 0) regex.lastIndex++;
        }
        if (lastIndex < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        textNode.parentNode?.replaceChild(frag, textNode);
      });
    });

    this.activeIndex = this.marks.length ? 0 : -1;
    this._focusActive();
    this._updateCounter();
  }

  private _navigate(delta: number): void {
    if (!this.marks.length) return;
    this.activeIndex = (this.activeIndex + delta + this.marks.length) % this.marks.length;
    this._focusActive();
    this._updateCounter();
  }

  private _focusActive(): void {
    this.marks.forEach((m) => m.classList.remove('be-find-mark--active'));
    const active = this.marks[this.activeIndex];
    if (active) {
      active.classList.add('be-find-mark--active');
      active.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  private _updateCounter(): void {
    if (!this.counterEl) return;
    this.counterEl.textContent = this.marks.length ? `${this.activeIndex + 1}/${this.marks.length}` : '0/0';
  }

  private _replaceCurrent(): void {
    const active = this.marks[this.activeIndex];
    if (!active) return;
    const replacement = this.replaceInput?.value ?? '';
    const textNode = document.createTextNode(replacement);
    active.parentNode?.replaceChild(textNode, active);
    textNode.parentElement?.normalize();
    this._search();
  }

  private _replaceAll(): void {
    if (!this.marks.length) return;
    const replacement = this.replaceInput?.value ?? '';
    this.marks.forEach((mark) => {
      const textNode = document.createTextNode(replacement);
      mark.parentNode?.replaceChild(textNode, mark);
      textNode.parentElement?.normalize();
    });
    this.marks = [];
    this.activeIndex = -1;
    this._search();
  }
}
