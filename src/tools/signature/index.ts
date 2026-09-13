/**
 * SignatureTool — Signature pad block (draw + save as PNG dataURL)
 */
interface SignatureData {
  dataUrl: string;
}

export default class SignatureTool {
  static get toolbox() {
    return {
      title: 'Signature',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17c2-4 4-4 5-1s3 3 5-1 4-6 6-2"/><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M3 21h18"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: SignatureData;
  private wrapper: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private readOnly: boolean;
  private lastX = 0;
  private lastY = 0;

  constructor({ data, readOnly }: any) {
    this.data = { dataUrl: data.dataUrl || '' };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-signature-tool');

    if (this.readOnly) {
      if (this.data.dataUrl) {
        const img = document.createElement('img');
        img.src = this.data.dataUrl;
        img.classList.add('be-signature-tool__image');
        this.wrapper.appendChild(img);
      }
      return this.wrapper;
    }

    const toolbar = document.createElement('div');
    toolbar.classList.add('be-signature-tool__toolbar');
    toolbar.innerHTML = '<span>Sign below</span>';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';
    clearBtn.classList.add('be-signature-tool__clear');
    clearBtn.addEventListener('click', () => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.data.dataUrl = '';
      }
    });
    toolbar.appendChild(clearBtn);
    this.wrapper.appendChild(toolbar);

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('be-signature-tool__canvas');
    this.canvas.width = 500;
    this.canvas.height = 160;
    this.ctx = this.canvas.getContext('2d');

    if (this.data.dataUrl && this.ctx) {
      const img = new Image();
      img.onload = () => { this.ctx?.drawImage(img, 0, 0); };
      img.src = this.data.dataUrl;
    }

    this.canvas.addEventListener('mousedown', (e) => this._start(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mousemove', (e) => this._move(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mouseup', () => this._end());
    this.canvas.addEventListener('mouseleave', () => this._end());

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const { x, y } = this._touchCoords(e);
      this._start(x, y);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const { x, y } = this._touchCoords(e);
      this._move(x, y);
    });
    this.canvas.addEventListener('touchend', () => this._end());

    this.wrapper.appendChild(this.canvas);
    return this.wrapper;
  }

  private _touchCoords(e: TouchEvent): { x: number; y: number } {
    const rect = this.canvas!.getBoundingClientRect();
    const touch = e.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  private _start(x: number, y: number): void {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
  }

  private _move(x: number, y: number): void {
    if (!this.isDrawing || !this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = '#1f2937';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  private _end(): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.canvas) this.data.dataUrl = this.canvas.toDataURL('image/png');
  }

  save(): SignatureData {
    return this.data;
  }

  validate(data: SignatureData): boolean {
    return !!data.dataUrl;
  }
}
