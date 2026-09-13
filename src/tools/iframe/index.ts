/**
 * IframeTool — Custom iframe embed block for Editor.js
 */
interface IframeData { url: string; width: string; height: string; caption: string; }

export default class IframeTool {
  static get toolbox() {
    return {
      title: 'Iframe',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path stroke="currentColor" stroke-width="2" d="M3 9h18"/></svg>',
    };
  }
  static get isReadOnlySupported() { return true; }

  private data: IframeData;
  private wrapper: HTMLElement | null = null;
  private readOnly: boolean;

  constructor({ data, readOnly }: any) {
    this.data = { url: data.url || '', width: data.width || '100%', height: data.height || '400px', caption: data.caption || '' };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-iframe-tool');
    if (this.data.url) { this._renderIframe(); } else { this._renderInput(); }
    return this.wrapper;
  }

  private _renderIframe(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('be-iframe-tool__container');
    const iframe = document.createElement('iframe');
    iframe.src = this.data.url;
    iframe.style.width = this.data.width;
    iframe.style.height = this.data.height;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    container.appendChild(iframe);
    this.wrapper.appendChild(container);
    if (!this.readOnly) {
      const caption = document.createElement('div');
      caption.classList.add('be-iframe-tool__caption');
      caption.contentEditable = 'true';
      caption.setAttribute('data-placeholder', 'Caption');
      caption.innerHTML = this.data.caption;
      caption.addEventListener('input', () => { this.data.caption = caption.innerHTML; });
      this.wrapper.appendChild(caption);
    }
  }

  private _renderInput(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('be-iframe-tool__input');
    input.placeholder = 'Paste iframe URL (https://...)';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const url = input.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          this.data.url = url;
          this._renderIframe();
        }
      }
    });
    this.wrapper.appendChild(input);
  }

  save(): IframeData { return this.data; }
  validate(data: IframeData): boolean { return !!data.url; }
}
