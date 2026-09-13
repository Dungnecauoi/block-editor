/**
 * QRCodeTool — Generates a QR code from text/URL, rendered to a canvas
 */
interface QRCodeData {
  text: string;
  size: number;
}

export default class QRCodeTool {
  static get toolbox() {
    return {
      title: 'QR Code',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="7" height="7" x="3" y="3" stroke="currentColor" stroke-width="2" rx="1"/><rect width="7" height="7" x="14" y="3" stroke="currentColor" stroke-width="2" rx="1"/><rect width="7" height="7" x="3" y="14" stroke="currentColor" stroke-width="2" rx="1"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M14 14h3m4 0h-1m-6 3h1m3 0h3m-4 4h4m-7-1v1"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: QRCodeData;
  private wrapper: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private readOnly: boolean;
  private inputEl: HTMLInputElement | null = null;

  constructor({ data, readOnly }: any) {
    this.data = { text: data.text || '', size: data.size || 200 };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-qrcode-tool');

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('be-qrcode-tool__canvas');
    this.wrapper.appendChild(this.canvas);

    if (!this.readOnly) {
      this.inputEl = document.createElement('input');
      this.inputEl.type = 'text';
      this.inputEl.placeholder = 'Enter text or URL to encode...';
      this.inputEl.classList.add('be-qrcode-tool__input');
      this.inputEl.value = this.data.text;
      this.inputEl.addEventListener('input', () => {
        this.data.text = this.inputEl!.value;
        this._render();
      });
      this.wrapper.appendChild(this.inputEl);
    } else {
      const caption = document.createElement('div');
      caption.classList.add('be-qrcode-tool__caption');
      caption.textContent = this.data.text;
      this.wrapper.appendChild(caption);
    }

    this._render();
    return this.wrapper;
  }

  private async _render(): Promise<void> {
    if (!this.canvas) return;
    if (!this.data.text) {
      const ctx = this.canvas.getContext('2d');
      this.canvas.width = this.data.size;
      this.canvas.height = this.data.size;
      if (ctx) {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }
    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(this.canvas, this.data.text, {
        width: this.data.size,
        margin: 1,
      });
    } catch (err) {
      console.warn('[QRCodeTool] Failed to generate QR code:', err);
    }
  }

  save(): QRCodeData {
    return this.data;
  }

  validate(data: QRCodeData): boolean {
    return !!data.text;
  }
}
