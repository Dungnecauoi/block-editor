/**
 * ChartTool — Simple bar/line/pie chart block rendered on canvas, no external chart library
 */
interface ChartRow {
  label: string;
  value: number;
}

interface ChartData {
  chartType: 'bar' | 'line' | 'pie';
  title: string;
  rows: ChartRow[];
  color: string;
}

const PALETTE = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default class ChartTool {
  static get toolbox() {
    return {
      title: 'Chart',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v18h18"/><rect width="3" height="8" x="7" y="10" fill="currentColor" rx="1"/><rect width="3" height="12" x="12" y="6" fill="currentColor" rx="1"/><rect width="3" height="5" x="17" y="13" fill="currentColor" rx="1"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: ChartData;
  private wrapper: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private readOnly: boolean;
  private rowsContainer: HTMLElement | null = null;
  private themeText = '#1f2937';
  private themeTextSecondary = '#6b7280';
  private themeBorder = '#e5e7eb';

  constructor({ data, readOnly }: any) {
    this.data = {
      chartType: data.chartType || 'bar',
      title: data.title || '',
      rows: Array.isArray(data.rows) && data.rows.length
        ? data.rows
        : [{ label: 'A', value: 10 }, { label: 'B', value: 20 }, { label: 'C', value: 15 }],
      color: data.color || PALETTE[0],
    };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-chart-tool');

    if (!this.readOnly) {
      const controls = document.createElement('div');
      controls.classList.add('be-chart-tool__controls');

      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.placeholder = 'Chart title';
      titleInput.value = this.data.title;
      titleInput.classList.add('be-chart-tool__title-input');
      titleInput.addEventListener('input', () => {
        this.data.title = titleInput.value;
        this._draw();
      });

      const typeSelect = document.createElement('select');
      typeSelect.classList.add('be-chart-tool__type-select');
      ['bar', 'line', 'pie'].forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t[0].toUpperCase() + t.slice(1);
        if (t === this.data.chartType) opt.selected = true;
        typeSelect.appendChild(opt);
      });
      typeSelect.addEventListener('change', () => {
        this.data.chartType = typeSelect.value as ChartData['chartType'];
        this._draw();
      });

      controls.appendChild(titleInput);
      controls.appendChild(typeSelect);
      this.wrapper.appendChild(controls);

      this.rowsContainer = document.createElement('div');
      this.rowsContainer.classList.add('be-chart-tool__rows');
      this.wrapper.appendChild(this.rowsContainer);
      this._renderRows();

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = '+ Add row';
      addBtn.classList.add('be-chart-tool__add-row');
      addBtn.addEventListener('click', () => {
        this.data.rows.push({ label: `Item ${this.data.rows.length + 1}`, value: 0 });
        this._renderRows();
        this._draw();
      });
      this.wrapper.appendChild(addBtn);
    }

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('be-chart-tool__canvas');
    this.canvas.width = 600;
    this.canvas.height = 300;
    this.wrapper.appendChild(this.canvas);

    this._draw();
    return this.wrapper;
  }

  private _renderRows(): void {
    if (!this.rowsContainer) return;
    this.rowsContainer.innerHTML = '';
    this.data.rows.forEach((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.classList.add('be-chart-tool__row');

      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.value = row.label;
      labelInput.placeholder = 'Label';
      labelInput.addEventListener('input', () => {
        this.data.rows[i].label = labelInput.value;
        this._draw();
      });

      const valueInput = document.createElement('input');
      valueInput.type = 'number';
      valueInput.value = String(row.value);
      valueInput.placeholder = 'Value';
      valueInput.addEventListener('input', () => {
        this.data.rows[i].value = parseFloat(valueInput.value) || 0;
        this._draw();
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '✕';
      removeBtn.classList.add('be-chart-tool__row-remove');
      removeBtn.addEventListener('click', () => {
        this.data.rows.splice(i, 1);
        this._renderRows();
        this._draw();
      });

      rowEl.appendChild(labelInput);
      rowEl.appendChild(valueInput);
      rowEl.appendChild(removeBtn);
      this.rowsContainer!.appendChild(rowEl);
    });
  }

  private _readThemeColors(): void {
    if (!this.wrapper) return;
    const styles = getComputedStyle(this.wrapper);
    const read = (name: string, fallback: string) => {
      const value = styles.getPropertyValue(name).trim();
      return value || fallback;
    };
    this.themeText = read('--be-text', '#1f2937');
    this.themeTextSecondary = read('--be-text-secondary', '#6b7280');
    this.themeBorder = read('--be-border', '#e5e7eb');
  }

  private _draw(): void {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    this._readThemeColors();
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    if (this.data.title) {
      ctx.fillStyle = this.themeText;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.data.title, width / 2, 22);
    }

    const rows = this.data.rows.filter(r => r.label);
    if (!rows.length) return;

    if (this.data.chartType === 'pie') {
      this._drawPie(ctx, rows, width, height);
    } else if (this.data.chartType === 'line') {
      this._drawLine(ctx, rows, width, height);
    } else {
      this._drawBar(ctx, rows, width, height);
    }
  }

  private _drawBar(ctx: CanvasRenderingContext2D, rows: ChartRow[], width: number, height: number): void {
    const top = 40, bottom = height - 30, left = 40, right = width - 20;
    const max = Math.max(...rows.map(r => r.value), 1);
    const barWidth = (right - left) / rows.length;

    ctx.strokeStyle = this.themeBorder;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    rows.forEach((row, i) => {
      const barHeight = ((bottom - top) * row.value) / max;
      const x = left + i * barWidth + barWidth * 0.15;
      const w = barWidth * 0.7;
      ctx.fillStyle = this.data.color;
      ctx.fillRect(x, bottom - barHeight, w, barHeight);

      ctx.fillStyle = this.themeTextSecondary;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(row.label, x + w / 2, bottom + 16);
      ctx.fillStyle = this.themeText;
      ctx.fillText(String(row.value), x + w / 2, bottom - barHeight - 6);
    });
  }

  private _drawLine(ctx: CanvasRenderingContext2D, rows: ChartRow[], width: number, height: number): void {
    const top = 40, bottom = height - 30, left = 40, right = width - 20;
    const max = Math.max(...rows.map(r => r.value), 1);
    const step = (right - left) / Math.max(rows.length - 1, 1);

    ctx.strokeStyle = this.themeBorder;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = this.data.color;
    ctx.lineWidth = 2;
    rows.forEach((row, i) => {
      const x = left + i * step;
      const y = bottom - ((bottom - top) * row.value) / max;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    rows.forEach((row, i) => {
      const x = left + i * step;
      const y = bottom - ((bottom - top) * row.value) / max;
      ctx.fillStyle = this.data.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.themeTextSecondary;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(row.label, x, bottom + 16);
    });
  }

  private _drawPie(ctx: CanvasRenderingContext2D, rows: ChartRow[], width: number, height: number): void {
    const total = rows.reduce((sum, r) => sum + Math.max(r.value, 0), 0) || 1;
    const cx = width / 2 - 60, cy = height / 2 + 10, radius = Math.min(height - 80, 160) / 2;
    let angle = -Math.PI / 2;

    rows.forEach((row, i) => {
      const slice = (Math.max(row.value, 0) / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      angle += slice;
    });

    let legendY = cy - radius;
    rows.forEach((row, i) => {
      const ly = legendY + i * 20;
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fillRect(cx + radius + 30, ly, 12, 12);
      ctx.fillStyle = this.themeText;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${row.label} (${row.value})`, cx + radius + 48, ly + 10);
    });
  }

  save(): ChartData {
    return this.data;
  }

  validate(data: ChartData): boolean {
    return Array.isArray(data.rows) && data.rows.length > 0;
  }
}
