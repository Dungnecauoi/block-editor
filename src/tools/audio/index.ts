/**
 * AudioTool — Custom audio block for Editor.js
 */

interface AudioData {
  url: string;
  title: string;
  caption: string;
}

export default class AudioTool {
  static get toolbox() {
    return {
      title: 'Audio',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: AudioData;
  private wrapper: HTMLElement | null = null;
  private config: any;
  private api: any;
  private readOnly: boolean;

  constructor({ data, config, api, readOnly }: any) {
    this.data = {
      url: data.url || '',
      title: data.title || '',
      caption: data.caption || '',
    };
    this.config = config || {};
    this.api = api;
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-audio-tool');

    if (this.data.url) {
      this._renderPlayer();
    } else {
      this._renderUploadUI();
    }
    return this.wrapper;
  }

  private _renderPlayer(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('be-audio-tool__player');

    // Icon
    const icon = document.createElement('div');
    icon.classList.add('be-audio-tool__icon');
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5"/></svg>';
    container.appendChild(icon);

    // Info
    const info = document.createElement('div');
    info.classList.add('be-audio-tool__info');

    if (this.data.title || !this.readOnly) {
      const title = document.createElement('div');
      title.classList.add('be-audio-tool__title');
      if (!this.readOnly) {
        title.contentEditable = 'true';
        title.setAttribute('data-placeholder', 'Audio title');
        title.addEventListener('input', () => { this.data.title = title.textContent || ''; });
      }
      title.textContent = this.data.title;
      info.appendChild(title);
    }

    // Audio element
    const audio = document.createElement('audio');
    audio.src = this.data.url;
    audio.controls = true;
    audio.style.width = '100%';
    audio.style.marginTop = '8px';
    info.appendChild(audio);

    container.appendChild(info);
    this.wrapper.appendChild(container);

    // Caption
    if (!this.readOnly) {
      const caption = document.createElement('div');
      caption.classList.add('be-audio-tool__caption');
      caption.contentEditable = 'true';
      caption.setAttribute('data-placeholder', 'Caption');
      caption.innerHTML = this.data.caption;
      caption.addEventListener('input', () => { this.data.caption = caption.innerHTML; });
      this.wrapper.appendChild(caption);
    } else if (this.data.caption) {
      const caption = document.createElement('div');
      caption.classList.add('be-audio-tool__caption');
      caption.innerHTML = this.data.caption;
      this.wrapper.appendChild(caption);
    }
  }

  private _renderUploadUI(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    const uploadArea = document.createElement('div');
    uploadArea.classList.add('be-audio-tool__upload');
    uploadArea.innerHTML = `
      <div class="be-audio-tool__upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
      <div class="be-audio-tool__upload-text">Click to upload audio or paste URL</div>
    `;

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.classList.add('be-audio-tool__url-input');
    urlInput.placeholder = 'Paste audio URL (MP3, WAV, OGG...)';
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.data.url = urlInput.value;
        this._renderPlayer();
      }
    });

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      await this._uploadFile(file);
    });

    uploadArea.addEventListener('click', () => fileInput.click());
    this.wrapper.appendChild(uploadArea);
    this.wrapper.appendChild(urlInput);
    this.wrapper.appendChild(fileInput);
  }

  private async _uploadFile(file: File): Promise<void> {
    if (this.config.uploader?.uploadByFile) {
      const response = await this.config.uploader.uploadByFile(file);
      if (response.success) {
        this.data.url = response.file.url;
        this.data.title = this.data.title || file.name;
        this._renderPlayer();
      }
    } else {
      this.data.url = URL.createObjectURL(file);
      this.data.title = this.data.title || file.name;
      this._renderPlayer();
    }
  }

  save(): AudioData { return this.data; }
  validate(data: AudioData): boolean { return !!data.url; }
}
