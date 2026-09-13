/**
 * positionFixedPanel — Anchors a `position: fixed` panel below (or above, if
 * there isn't room) a trigger element, clamped to stay fully inside the
 * viewport horizontally.
 *
 * Inline tools that need extra UI (a color palette, a link form, ...) render
 * it via Editor.js's `renderActions()`, which inserts the returned element
 * as a sibling inside `.ce-popover__items` — a flex row with `overflow:
 * hidden` on its ancestor `.ce-popover__container`. `position: absolute`
 * would get clipped by that overflow; `position: fixed` escapes it entirely,
 * but then needs its coordinates computed by hand relative to the trigger.
 */
export function positionFixedPanel(
  anchor: HTMLElement,
  panel: HTMLElement,
  estimatedWidth: number,
  estimatedHeight: number,
): void {
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const viewportPadding = 12;

  let left = rect.left;
  if (left + estimatedWidth > window.innerWidth - viewportPadding) {
    left = window.innerWidth - estimatedWidth - viewportPadding;
  }
  left = Math.max(viewportPadding, left);

  const fitsBelow = rect.bottom + margin + estimatedHeight <= window.innerHeight - viewportPadding;
  const top = fitsBelow
    ? rect.bottom + margin
    : Math.max(viewportPadding, rect.top - margin - estimatedHeight);

  panel.style.position = 'fixed';
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}
