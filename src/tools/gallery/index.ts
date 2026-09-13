/**
 * GalleryTool — Multi-image gallery block for Editor.js
 */

interface GalleryImage {
  url: string;
  caption: string;
}

interface GalleryData {
  images: GalleryImage[];
  layout: 'grid' | 'masonry' | 'carousel';
  columns: number;
}

export default class GalleryTool {
  static get toolbox() {
    return {
      title: 'Gallery',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: GalleryData;
  private wrapper: HTMLElement | null = null;
  private config: any;
  private api: any;
  private readOnly: boolean;

  constructor({ data, config, api, readOnly }: any) {
    this.data = {
      images: data.images || [],
      layout: data.layout || 'grid',
      columns: data.columns || 3,
    };
    this.config = config || {};
    this.api = api;
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-gallery-tool');
    this._renderGallery();
    return this.wrapper;
  }

  private _renderGallery(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    if (this.data.images.length === 0 && !this.readOnly) {
      this._renderUploadUI();
      return;
    }

    // Grid container
    const grid = document.createElement('div');
    grid.classList.add('be-gallery-tool__grid');
    grid.style.gridTemplateColumns = `repeat(${this.data.columns}, 1fr)`;

    this.data.images.forEach((img, index) => {
      const item = document.createElement('div');
      item.classList.add('be-gallery-tool__item');

      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.alt = img.caption || '';
      imgEl.loading = 'lazy';
      item.appendChild(imgEl);

      if (!this.readOnly) {
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('be-gallery-tool__remove');
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.data.images.splice(index, 1);
          this._renderGallery();
        });
        item.appendChild(removeBtn);
      }

      grid.appendChild(item);
    });

    this.wrapper.appendChild(grid);

    // Add more button
    if (!this.readOnly) {
      const addBtn = document.createElement('button');
      addBtn.classList.add('be-gallery-tool__add-btn');
      addBtn.textContent = '+ Add images';
      addBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.addEventListener('change', async () => {
          const files = Array.from(fileInput.files || []);
          for (const file of files) {
            await this._addImage(file);
          }
          this._renderGallery();
        });
        fileInput.click();
      });
      this.wrapper.appendChild(addBtn);

      // Layout controls
      const controls = document.createElement('div');
      controls.classList.add('be-gallery-tool__controls');
      [2, 3, 4].forEach(cols => {
        const btn = document.createElement('button');
        btn.classList.add('be-gallery-tool__col-btn');
        if (this.data.columns === cols) btn.classList.add('be-gallery-tool__col-btn--active');
        btn.textContent = `${cols} cols`;
        btn.addEventListener('click', () => {
          this.data.columns = cols;
          this._renderGallery();
        });
        controls.appendChild(btn);
      });
      this.wrapper.appendChild(controls);
    }
  }

  private _renderUploadUI(): void {
    if (!this.wrapper) return;

    const uploadArea = document.createElement('div');
    uploadArea.classList.add('be-gallery-tool__upload');
    uploadArea.innerHTML = `
      <div class="be-gallery-tool__upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
      <div class="be-gallery-tool__upload-text">Click to select images for gallery</div>
    `;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', async () => {
      const files = Array.from(fileInput.files || []);
      for (const file of files) {
        await this._addImage(file);
      }
      this._renderGallery();
    });

    uploadArea.addEventListener('click', () => fileInput.click());
    this.wrapper.appendChild(uploadArea);
    this.wrapper.appendChild(fileInput);
  }

  private async _addImage(file: File): Promise<void> {
    if (this.config.uploader?.uploadByFile) {
      const response = await this.config.uploader.uploadByFile(file);
      if (response.success) {
        this.data.images.push({ url: response.file.url, caption: '' });
      }
    } else {
      this.data.images.push({ url: URL.createObjectURL(file), caption: '' });
    }
  }

  save(): GalleryData { return this.data; }
  validate(data: GalleryData): boolean { return data.images.length > 0; }
}
