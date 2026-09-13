/**
 * VideoTool — Custom video block for Editor.js
 * Supports: URL paste, file upload, YouTube/Vimeo embeds
 */

interface VideoData {
  url: string;
  caption: string;
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  poster: string;
  service: 'local' | 'youtube' | 'vimeo' | 'other';
  width: string;
  height: string;
}

interface VideoToolConfig {
  uploader?: {
    uploadByFile?: (file: File) => Promise<{ success: boolean; file: { url: string } }>;
  };
  endpoints?: {
    byFile?: string;
  };
  captionPlaceholder?: string;
}

export default class VideoTool {
  static get toolbox() {
    return {
      title: 'Video',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12L10 15.4641V8.5359L15 12Z"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/></svg>',
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  private data: VideoData;
  private wrapper: HTMLElement | null = null;
  private config: VideoToolConfig;
  private api: any;
  private readOnly: boolean;

  constructor({ data, config, api, readOnly }: any) {
    this.data = {
      url: data.url || '',
      caption: data.caption || '',
      autoplay: data.autoplay || false,
      muted: data.muted || false,
      controls: data.controls !== false,
      poster: data.poster || '',
      service: data.service || 'local',
      width: data.width || '100%',
      height: data.height || 'auto',
    };
    this.config = config || {};
    this.api = api;
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-video-tool');

    if (this.data.url) {
      this._renderVideo();
    } else {
      this._renderUploadUI();
    }

    return this.wrapper;
  }

  private _renderVideo(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    const container = document.createElement('div');
    container.classList.add('be-video-tool__container');

    const service = this._detectService(this.data.url);

    if (service === 'youtube' || service === 'vimeo') {
      const iframe = document.createElement('iframe');
      iframe.src = this._getEmbedUrl(this.data.url, service);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.style.width = '100%';
      iframe.style.aspectRatio = '16/9';
      iframe.style.borderRadius = '8px';
      container.appendChild(iframe);
    } else {
      const video = document.createElement('video');
      video.src = this.data.url;
      video.controls = this.data.controls;
      video.autoplay = this.data.autoplay;
      video.muted = this.data.muted;
      if (this.data.poster) video.poster = this.data.poster;
      video.style.width = '100%';
      video.style.borderRadius = '8px';
      video.style.maxHeight = '500px';
      container.appendChild(video);
    }

    this.wrapper.appendChild(container);

    // Caption
    if (!this.readOnly) {
      const caption = document.createElement('div');
      caption.classList.add('be-video-tool__caption');
      caption.contentEditable = 'true';
      caption.setAttribute('data-placeholder', this.config.captionPlaceholder || 'Video caption');
      caption.innerHTML = this.data.caption;
      caption.addEventListener('input', () => {
        this.data.caption = caption.innerHTML;
      });
      this.wrapper.appendChild(caption);
    } else if (this.data.caption) {
      const caption = document.createElement('div');
      caption.classList.add('be-video-tool__caption');
      caption.innerHTML = this.data.caption;
      this.wrapper.appendChild(caption);
    }
  }

  private _renderUploadUI(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    const uploadArea = document.createElement('div');
    uploadArea.classList.add('be-video-tool__upload');
    uploadArea.innerHTML = `
      <div class="be-video-tool__upload-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12L10 15.4641V8.5359L15 12Z"/><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
      <div class="be-video-tool__upload-text">Click to upload video or paste URL</div>
    `;

    // URL input
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.classList.add('be-video-tool__url-input');
    urlInput.placeholder = 'Paste YouTube, Vimeo, or video URL...';
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.data.url = urlInput.value;
        this.data.service = this._detectService(urlInput.value);
        this._renderVideo();
      }
    });

    // File input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
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
      try {
        const response = await this.config.uploader.uploadByFile(file);
        if (response.success) {
          this.data.url = response.file.url;
          this.data.service = 'local';
          this._renderVideo();
        }
      } catch (error) {
        console.error('Video upload failed:', error);
      }
    } else if (this.config.endpoints?.byFile) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(this.config.endpoints.byFile, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          this.data.url = data.file.url;
          this.data.service = 'local';
          this._renderVideo();
        }
      } catch (error) {
        console.error('Video upload failed:', error);
      }
    } else {
      // Fallback: use blob URL for preview
      this.data.url = URL.createObjectURL(file);
      this.data.service = 'local';
      this._renderVideo();
    }
  }

  private _detectService(url: string): VideoData['service'] {
    if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
    if (/vimeo\.com/i.test(url)) return 'vimeo';
    return 'local';
  }

  private _getEmbedUrl(url: string, service: string): string {
    if (service === 'youtube') {
      const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }
    if (service === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    }
    return url;
  }

  save(): VideoData {
    return this.data;
  }

  validate(data: VideoData): boolean {
    return !!data.url;
  }

  static get sanitize() {
    return {
      url: false,
      caption: { br: true, b: true, i: true, a: true },
    };
  }
}
