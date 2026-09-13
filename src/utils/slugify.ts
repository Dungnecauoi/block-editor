/**
 * slugify — Turns heading text into a stable, URL-safe anchor id.
 * Shared between the live Table of Contents plugin and the static HTML exporter
 * so generated anchors match in both places.
 */
export function slugify(text: string, usedSlugs?: Set<string>): string {
  const plain = text.replace(/<[^>]+>/g, '');
  let base = plain
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!base) base = 'section';

  if (usedSlugs) {
    let slug = base;
    let i = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${i++}`;
    }
    usedSlugs.add(slug);
    return slug;
  }

  return base;
}
