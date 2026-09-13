/**
 * MediaLibrary — Modal picker for re-using previously uploaded media
 */
import type { MediaItem } from '../../types';

export interface MediaLibraryOptions {
  getItems: () => Promise<MediaItem[]> | MediaItem[];
  onSelect: (item: MediaItem) => void;
}

export class MediaLibrary {
  private container: HTMLElement;
  private options: MediaLibraryOptions;
  private overlay: HTMLElement | null = null;

  constructor(container: HTMLElement, options: MediaLibraryOptions) {
    this.container = container;
    this.options = options;
  }

  async open(): Promise<void> {
    this.overlay = document.createElement('div');
    this.overlay.className = 'be-media-library-overlay';
    this.overlay.innerHTML = `
      <div class="be-media-library">
        <div class="be-media-library__header">
          <span>Media Library</span>
          <button type="button" class="be-media-library__close" data-action="close">✕</button>
        </div>
        <div class="be-media-library__body">
          <div class="be-media-library__loading">Loading...</div>
        </div>
      </div>
    `;

    this.overlay.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target === this.overlay || target.dataset.action === 'close') this.close();
    });

    this.container.appendChild(this.overlay);

    try {
      const items = await this.options.getItems();
      this._renderItems(items);
    } catch (err) {
      this._renderError();
    }
  }

  close(): void {
    this.overlay?.remove();
    this.overlay = null;
  }

  private _renderItems(items: MediaItem[]): void {
    const body = this.overlay?.querySelector('.be-media-library__body');
    if (!body) return;

    if (!items.length) {
      body.innerHTML = '<div class="be-media-library__empty">No uploaded media yet. Files you upload will appear here for reuse.</div>';
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'be-media-library__grid';

    items.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'be-media-library__item';

      if (item.type === 'image' || item.thumbnail) {
        const img = document.createElement('img');
        img.src = item.thumbnail || item.url;
        img.loading = 'lazy';
        card.appendChild(img);
      } else {
        const icon = document.createElement('div');
        icon.className = 'be-media-library__icon';
        icon.textContent = item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '📎';
        card.appendChild(icon);
      }

      const label = document.createElement('span');
      label.className = 'be-media-library__label';
      label.textContent = item.name || item.url.split('/').pop() || 'file';
      card.appendChild(label);

      card.addEventListener('click', () => {
        this.options.onSelect(item);
        this.close();
      });

      grid.appendChild(card);
    });

    body.innerHTML = '';
    body.appendChild(grid);
  }

  private _renderError(): void {
    const body = this.overlay?.querySelector('.be-media-library__body');
    if (body) body.innerHTML = '<div class="be-media-library__empty">Failed to load media library.</div>';
  }
}
