/**
 * InlineToolbarClamp — Nudges Editor.js's inline toolbar back into the
 * viewport whenever its own positioning math places it off-screen.
 *
 * Editor.js positions `.ce-inline-toolbar` (left/top inline styles) based on
 * the selected text's position and its own computed width — it doesn't
 * clamp against viewport edges. Near the top of the page it can end up with
 * a negative `top` (rendered above the viewport); on narrow screens or near
 * the left edge, `left` can go negative or push the toolbar past the right
 * edge. Since this lives inside Editor.js core, it can't be fixed with CSS —
 * this observes for the toolbar appearing and corrects its position after
 * Editor.js has finished laying it out.
 */
export class InlineToolbarClamp {
  private container: HTMLElement;
  private observer: MutationObserver | null = null;
  private scheduled = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  attach(): void {
    this.observer = new MutationObserver(() => this._schedule());
    this.observer.observe(this.container, { childList: true, subtree: true });
  }

  detach(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private _schedule(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      this._clamp();
    });
  }

  private _clamp(): void {
    const toolbar = this.container.querySelector<HTMLElement>('.ce-inline-toolbar');
    if (!toolbar) return;

    // The wrapper (`.ce-inline-toolbar`, which carries the inline left/top
    // style we can safely adjust) is not the same box as the visible card
    // (`.ce-popover__container`, positioned relative to it) — the card can
    // extend well past the wrapper's own small box in any direction, so it
    // has to be what we measure, even though we still correct the wrapper.
    const card = toolbar.querySelector<HTMLElement>('.ce-popover__container') || toolbar;
    const rect = card.getBoundingClientRect();
    const margin = 8;
    let deltaX = 0;
    let deltaY = 0;

    if (rect.left < margin) {
      deltaX = margin - rect.left;
    } else if (rect.right > window.innerWidth - margin) {
      deltaX = window.innerWidth - margin - rect.right;
    }

    if (rect.top < margin) {
      deltaY = margin - rect.top;
    } else if (rect.bottom > window.innerHeight - margin) {
      deltaY = window.innerHeight - margin - rect.bottom;
    }

    if (deltaX === 0 && deltaY === 0) return;

    const currentLeft = parseFloat(toolbar.style.left || '0') || 0;
    const currentTop = parseFloat(toolbar.style.top || '0') || 0;
    toolbar.style.left = `${currentLeft + deltaX}px`;
    toolbar.style.top = `${currentTop + deltaY}px`;
  }
}
