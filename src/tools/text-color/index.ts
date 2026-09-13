/**
 * TextColorTool — Inline text/highlight color picker.
 *
 * Replaces `editorjs-text-color-plugin`, which throws
 * `Cannot read properties of undefined (reading 'colorCollections')` and
 * renders no swatch panel at all on the currently pinned Editor.js core
 * (2.30.x uses the newer Popover-based inline toolbar; that plugin was last
 * published for an older core and never got the config wired through). This
 * is a small first-party tool built directly against the current
 * `renderActions()` inline-tool API, so it's guaranteed to match what's
 * actually installed.
 */
import { positionFixedPanel } from '../../utils/position-panel';

const DEFAULT_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#111827', '#6B7280',
];

interface TextColorConfig {
  type?: 'text' | 'background';
  colors?: string[];
}

const TEXT_COLOR_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 15h6M6 19l5-13h2l5 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HIGHLIGHT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9 11-6 6v3h3l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export default class TextColorTool {
  static get isInline() { return true; }
  static get title() { return 'Text Color'; }

  static get sanitize() {
    return { span: { class: true, style: true } };
  }

  private api: any;
  private type: 'text' | 'background';
  private colors: string[];
  private button: HTMLButtonElement | null = null;
  private cssClass: string;

  constructor({ api, config }: { api: any; config?: TextColorConfig }) {
    this.api = api;
    this.type = config?.type || 'text';
    this.colors = config?.colors && config.colors.length ? config.colors : DEFAULT_COLORS;
    this.cssClass = `be-text-color--${this.type}`;
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add('ce-inline-tool', 'be-text-color-btn');
    this.button.innerHTML = this.type === 'background' ? HIGHLIGHT_ICON : TEXT_COLOR_ICON;
    this.button.title = this.type === 'background' ? 'Highlight Color' : 'Text Color';
    return this.button;
  }

  renderActions(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('be-text-color-actions');
    wrapper.style.position = 'fixed';
    wrapper.style.visibility = 'hidden';
    setTimeout(() => {
      if (this.button) positionFixedPanel(this.button, wrapper, 220, 44);
      wrapper.style.visibility = 'visible';
    }, 0);

    this.colors.forEach((color) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.classList.add('be-text-color-swatch');
      swatch.style.background = color;
      swatch.title = color;
      swatch.addEventListener('click', (e) => {
        e.preventDefault();
        this._applyColor(color);
      });
      wrapper.appendChild(swatch);
    });

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.classList.add('be-text-color-swatch', 'be-text-color-swatch--clear');
    clearBtn.title = 'Remove color';
    clearBtn.innerHTML = '✕';
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._applyColor(null);
    });
    wrapper.appendChild(clearBtn);

    return wrapper;
  }

  surround(range: Range): void {
    const existing = this._findWrappingSpan(range);
    if (existing) {
      this._unwrapSpan(existing);
      return;
    }
    this._wrapRange(range, this.colors[0]);
  }

  checkState(selection: Selection): boolean {
    if (selection.rangeCount === 0) {
      this.button?.classList.remove('ce-inline-tool--active');
      return false;
    }
    const active = !!this._findWrappingSpan(selection.getRangeAt(0));
    this.button?.classList.toggle('ce-inline-tool--active', active);
    return active;
  }

  private _applyColor(color: string | null): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const existing = this._findWrappingSpan(range);
    if (existing) this._unwrapSpan(existing);

    if (color) this._wrapRange(range, color);
    this.api.inlineToolbar.close();
  }

  private _wrapRange(range: Range, color: string): void {
    if (range.collapsed) return;
    const span = document.createElement('span');
    span.classList.add('be-text-color', this.cssClass);
    span.style[this.type === 'background' ? 'backgroundColor' : 'color'] = color;
    try {
      range.surroundContents(span);
    } catch {
      // Selection spans multiple elements (e.g. across a <b>) — extract & re-wrap instead.
      const frag = range.extractContents();
      span.appendChild(frag);
      range.insertNode(span);
    }
  }

  private _findWrappingSpan(range: Range): HTMLElement | null {
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    return (node as HTMLElement)?.closest(`.${this.cssClass}`) || null;
  }

  private _unwrapSpan(span: HTMLElement): void {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
    parent.normalize();
  }
}
