/**
 * media-diff — Computes added/removed/modified media file changes between two
 * editor snapshots, keyed by Editor.js's stable per-block `id`.
 *
 * This is a pure function so it can also run outside the editor (e.g. on a
 * backend, given the last-saved JSON and the newly submitted JSON) to decide
 * which uploaded files are now orphaned and safe to delete from storage.
 */
import type { OutputData, OutputBlockData } from '../types';

export interface MediaChange {
  blockId: string;
  blockType: string;
  changeType: 'added' | 'removed' | 'modified';
  /** URL that was in the previous (saved) snapshot, or null if this is a new file */
  old: string | null;
  /** URL that is in the new snapshot, or null if the file was removed */
  new: string | null;
}

type MediaExtractor = (data: any) => string[];

const MEDIA_EXTRACTORS: Record<string, MediaExtractor> = {
  image: (d) => (d?.file?.url || d?.url ? [d.file?.url || d.url] : []),
  simpleImage: (d) => (d?.url ? [d.url] : []),
  video: (d) => (d?.url ? [d.url] : []),
  audio: (d) => (d?.url ? [d.url] : []),
  attaches: (d) => (d?.file?.url ? [d.file.url] : []),
  gallery: (d) => (Array.isArray(d?.images) ? d.images.map((img: any) => img?.url).filter(Boolean) : []),
};

export const DEFAULT_MEDIA_BLOCK_TYPES = Object.keys(MEDIA_EXTRACTORS);

function extractUrls(block: OutputBlockData): string[] {
  const extractor = MEDIA_EXTRACTORS[block.type];
  return extractor ? extractor(block.data) : [];
}

function indexById(data: OutputData | null | undefined, allowedTypes: Set<string>): Map<string, OutputBlockData> {
  const map = new Map<string, OutputBlockData>();
  (data?.blocks || []).forEach((block) => {
    if (block.id && allowedTypes.has(block.type)) map.set(block.id, block);
  });
  return map;
}

/**
 * Diff two editor snapshots and return every media file that was added,
 * removed, or modified. Always diff against the last snapshot that was
 * actually persisted (confirmed saved) — never against an intermediate,
 * unsaved edit — so that N un-saved swaps of the same block collapse into a
 * single {old, new} pair using the real saved `old` value.
 */
export function diffMediaChanges(
  oldData: OutputData | null | undefined,
  newData: OutputData | null | undefined,
  options?: { blockTypes?: string[] },
): MediaChange[] {
  const allowedTypes = new Set(options?.blockTypes || DEFAULT_MEDIA_BLOCK_TYPES);
  const oldBlocks = indexById(oldData, allowedTypes);
  const newBlocks = indexById(newData, allowedTypes);
  const changes: MediaChange[] = [];

  oldBlocks.forEach((block, id) => {
    if (newBlocks.has(id)) return;
    extractUrls(block).forEach((url) => {
      changes.push({ blockId: id, blockType: block.type, changeType: 'removed', old: url, new: null });
    });
  });

  newBlocks.forEach((block, id) => {
    if (oldBlocks.has(id)) return;
    extractUrls(block).forEach((url) => {
      changes.push({ blockId: id, blockType: block.type, changeType: 'added', old: null, new: url });
    });
  });

  newBlocks.forEach((newBlock, id) => {
    const oldBlock = oldBlocks.get(id);
    if (!oldBlock) return;

    const oldUrls = extractUrls(oldBlock);
    const newUrls = extractUrls(newBlock);

    if (newBlock.type === 'gallery') {
      const oldSet = new Set(oldUrls);
      const newSet = new Set(newUrls);
      oldSet.forEach((url) => {
        if (!newSet.has(url)) changes.push({ blockId: id, blockType: newBlock.type, changeType: 'removed', old: url, new: null });
      });
      newSet.forEach((url) => {
        if (!oldSet.has(url)) changes.push({ blockId: id, blockType: newBlock.type, changeType: 'added', old: null, new: url });
      });
      return;
    }

    const oldUrl = oldUrls[0] || null;
    const newUrl = newUrls[0] || null;
    if (oldUrl === newUrl) return;

    if (!oldUrl && newUrl) {
      changes.push({ blockId: id, blockType: newBlock.type, changeType: 'added', old: null, new: newUrl });
    } else if (oldUrl && !newUrl) {
      changes.push({ blockId: id, blockType: newBlock.type, changeType: 'removed', old: oldUrl, new: null });
    } else {
      changes.push({ blockId: id, blockType: newBlock.type, changeType: 'modified', old: oldUrl, new: newUrl });
    }
  });

  return changes;
}
