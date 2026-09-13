/**
 * DrawingTool — Simple canvas drawing block for Editor.js
 */

interface DrawingData {
  dataUrl: string;
  width: number;
  height: number;
}

export default class DrawingTool {
  static get toolbox() {
    return {
      title: 'Drawing',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.06 6.19l3.75 3.75"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: DrawingData;
  private wrapper: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private readOnly: boolean;
  private lastX = 0;
  private lastY = 0;
  private penColor = '#1f2937';
  private penSize = 3;

  constructor({ data, readOnly }: any) {
    this.data = { dataUrl: data.dataUrl || '', width: data.width || 800, height: data.height || 400 };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-drawing-tool');

    if (this.readOnly && this.data.dataUrl) {
      const img = document.createElement('img');
      img.src = this.data.dataUrl;
      img.style.width = '100%';
      img.style.borderRadius = '8px';
      this.wrapper.appendChild(img);
    } else {
      this._renderCanvas();
    }

    return this.wrapper;
  }

  private _renderCanvas(): void {
    if (!this.wrapper) return;

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.classList.add('be-drawing-tool__toolbar');

    // Color buttons
    const colors = ['#1f2937', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    colors.forEach(color => {
      const btn = document.createElement('button');
      btn.classList.add('be-drawing-tool__color');
      btn.style.backgroundColor = color;
      if (color === this.penColor) btn.classList.add('be-drawing-tool__color--active');
      btn.addEventListener('click', () => {
        this.penColor = color;
        toolbar.querySelectorAll('.be-drawing-tool__color').forEach(b => b.classList.remove('be-drawing-tool__color--active'));
        btn.classList.add('be-drawing-tool__color--active');
      });
      toolbar.appendChild(btn);
    });

    // Size buttons
    [2, 4, 8].forEach(size => {
      const btn = document.createElement('button');
      btn.classList.add('be-drawing-tool__size');
      btn.textContent = size === 2 ? 'S' : size === 4 ? 'M' : 'L';
      if (size === this.penSize) btn.classList.add('be-drawing-tool__size--active');
      btn.addEventListener('click', () => {
        this.penSize = size;
        toolbar.querySelectorAll('.be-drawing-tool__size').forEach(b => b.classList.remove('be-drawing-tool__size--active'));
        btn.classList.add('be-drawing-tool__size--active');
      });
      toolbar.appendChild(btn);
    });

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.classList.add('be-drawing-tool__clear');
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.data.dataUrl = '';
      }
    });
    toolbar.appendChild(clearBtn);

    this.wrapper.appendChild(toolbar);

    // Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('be-drawing-tool__canvas');
    this.canvas.width = this.data.width;
    this.canvas.height = this.data.height;
    this.ctx = this.canvas.getContext('2d');

    // Load existing drawing
    if (this.data.dataUrl && this.ctx) {
      const img = new Image();
      img.onload = () => { this.ctx?.drawImage(img, 0, 0); };
      img.src = this.data.dataUrl;
    }

    // Drawing events
    this.canvas.addEventListener('mousedown', (e) => this._startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this._draw(e));
    this.canvas.addEventListener('mouseup', () => this._endDraw());
    this.canvas.addEventListener('mouseleave', () => this._endDraw());

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this._startDrawTouch(e); });
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this._drawTouch(e); });
    this.canvas.addEventListener('touchend', () => this._endDraw());

    this.wrapper.appendChild(this.canvas);
  }

  private _getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas!.getBoundingClientRect();
    const scaleX = this.canvas!.width / rect.width;
    const scaleY = this.canvas!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  private _startDraw(e: MouseEvent): void {
    this.isDrawing = true;
    const { x, y } = this._getCanvasCoords(e);
    this.lastX = x; this.lastY = y;
  }

  private _draw(e: MouseEvent): void {
    if (!this.isDrawing || !this.ctx) return;
    const { x, y } = this._getCanvasCoords(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.penColor;
    this.ctx.lineWidth = this.penSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    this.lastX = x; this.lastY = y;
  }

  private _startDrawTouch(e: TouchEvent): void {
    this.isDrawing = true;
    const touch = e.touches[0];
    const rect = this.canvas!.getBoundingClientRect();
    const scaleX = this.canvas!.width / rect.width;
    const scaleY = this.canvas!.height / rect.height;
    this.lastX = (touch.clientX - rect.left) * scaleX;
    this.lastY = (touch.clientY - rect.top) * scaleY;
  }

  private _drawTouch(e: TouchEvent): void {
    if (!this.isDrawing || !this.ctx) return;
    const touch = e.touches[0];
    const rect = this.canvas!.getBoundingClientRect();
    const scaleX = this.canvas!.width / rect.width;
    const scaleY = this.canvas!.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.penColor;
    this.ctx.lineWidth = this.penSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    this.lastX = x; this.lastY = y;
  }

  private _endDraw(): void {
    this.isDrawing = false;
    if (this.canvas) this.data.dataUrl = this.canvas.toDataURL('image/png');
  }

  save(): DrawingData { return this.data; }
  validate(data: DrawingData): boolean { return !!data.dataUrl; }
}
