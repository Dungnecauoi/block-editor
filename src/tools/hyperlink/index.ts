/**
 * HyperlinkTool — Inline link with target/rel options (opens in new tab, nofollow, etc).
 *
 * Replaces `editorjs-hyperlink`, whose own bundled CSS never sets
 * `position: absolute` on its form panel — it assumes the old flat
 * `.ce-inline-toolbar` layout where a `width:100%; display:block` panel
 * naturally drops to its own line below the button row. In the current
 * Editor.js Popover architecture, that panel is a sibling flex item inside
 * `.ce-popover__items` (a flex *row*), so it renders inline with the icons
 * instead of below them, overlapping the block's own text. This tool
 * explicitly anchors its panel with `position: absolute`, independent of the
 * parent's layout.
 */
import { positionFixedPanel } from '../../utils/position-panel';

const LINK_ICON ='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6M10 6l.9-.9a4.24 4.24 0 0 1 6 6L16 12M14 18l-.9.9a4.24 4.24 0 0 1-6-6L8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/></svg>';

interface HyperlinkConfig {
  availableTargets?: string[];
  availableRels?: string[];
  defaultTarget?: string;
  defaultRel?: string;
}

export default class HyperlinkTool {
  static get isInline() { return true; }
  static get title() { return 'Hyperlink'; }

  static get sanitize() {
    return { a: { href: true, target: true, rel: true } };
  }

  private api: any;
  private config: HyperlinkConfig;
  private button: HTMLButtonElement | null = null;
  private savedRange: Range | null = null;

  constructor({ api, config }: { api: any; config?: HyperlinkConfig }) {
    this.api = api;
    this.config = config || {};
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add('ce-inline-tool', 'be-hyperlink-btn');
    this.button.innerHTML = LINK_ICON;
    this.button.title = 'Hyperlink (target & rel options)';
    return this.button;
  }

  surround(range: Range): void {
    // Just remember the selection; the actual link is created from the
    // actions panel once the user fills in a URL and hits Save.
    this.savedRange = range.cloneRange();
  }

  checkState(selection: Selection): boolean {
    if (selection.rangeCount === 0) return false;
    let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    const active = !!(node as HTMLElement)?.closest('a[data-be-hyperlink]');
    this.button?.classList.toggle('ce-inline-tool--active', active);
    return active;
  }

  renderActions(): HTMLElement {
    const panel = document.createElement('div');
    panel.classList.add('be-hyperlink-panel');
    panel.style.position = 'fixed';
    panel.style.visibility = 'hidden';
    // Editor.js appends this element to the live DOM right after renderActions()
    // returns, so the button isn't laid out yet at this point — defer the
    // getBoundingClientRect()-based positioning by a tick.
    setTimeout(() => {
      if (this.button) positionFixedPanel(this.button, panel, 260, 150);
      panel.style.visibility = 'visible';
    }, 0);

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'https://...';
    urlInput.classList.add('be-hyperlink-panel__input');

    // Prefill from an existing link if the selection is already one
    const selection = window.getSelection();
    const existingLink = selection && selection.rangeCount
      ? this._findLink(selection.getRangeAt(0))
      : null;
    if (existingLink) urlInput.value = existingLink.getAttribute('href') || '';

    const row = document.createElement('div');
    row.classList.add('be-hyperlink-panel__row');

    const targets = this.config.availableTargets || ['_self', '_blank'];
    const targetSelect = document.createElement('select');
    targetSelect.classList.add('be-hyperlink-panel__select');
    targets.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      targetSelect.appendChild(opt);
    });
    if (existingLink?.getAttribute('target')) targetSelect.value = existingLink.getAttribute('target')!;

    const rels = this.config.availableRels || ['', 'nofollow', 'noreferrer'];
    const relSelect = document.createElement('select');
    relSelect.classList.add('be-hyperlink-panel__select');
    rels.forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r || 'rel: none';
      relSelect.appendChild(opt);
    });
    if (existingLink?.getAttribute('rel')) relSelect.value = existingLink.getAttribute('rel')!;

    row.appendChild(targetSelect);
    row.appendChild(relSelect);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = existingLink ? 'Update' : 'Save';
    saveBtn.classList.add('be-hyperlink-panel__save');
    saveBtn.addEventListener('click', () => {
      this._applyLink(urlInput.value.trim(), targetSelect.value, relSelect.value, existingLink);
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._applyLink(urlInput.value.trim(), targetSelect.value, relSelect.value, existingLink);
      }
    });

    panel.appendChild(urlInput);
    panel.appendChild(row);
    panel.appendChild(saveBtn);

    if (existingLink) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Remove link';
      removeBtn.classList.add('be-hyperlink-panel__remove');
      removeBtn.addEventListener('click', () => this._removeLink(existingLink));
      panel.appendChild(removeBtn);
    }

    setTimeout(() => urlInput.focus(), 0);
    return panel;
  }

  private _findLink(range: Range): HTMLAnchorElement | null {
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    return (node as HTMLElement)?.closest('a[data-be-hyperlink]') || null;
  }

  private _applyLink(url: string, target: string, rel: string, existingLink: HTMLAnchorElement | null): void {
    if (!url) return;
    let link = existingLink;
    if (!link) {
      const range = this.savedRange;
      if (!range || range.collapsed) return;
      link = document.createElement('a');
      link.setAttribute('data-be-hyperlink', 'true');
      try {
        range.surroundContents(link);
      } catch {
        const frag = range.extractContents();
        link.appendChild(frag);
        range.insertNode(link);
      }
    }
    link.setAttribute('href', url);
    if (target) link.setAttribute('target', target); else link.removeAttribute('target');
    if (rel) link.setAttribute('rel', rel); else link.removeAttribute('rel');
    this.api.inlineToolbar.close();
  }

  private _removeLink(link: HTMLAnchorElement): void {
    const parent = link.parentNode;
    if (!parent) return;
    while (link.firstChild) parent.insertBefore(link.firstChild, link);
    parent.removeChild(link);
    parent.normalize();
    this.api.inlineToolbar.close();
  }
}
