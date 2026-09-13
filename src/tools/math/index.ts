/**
 * MathTool — LaTeX/math formula block for Editor.js using KaTeX
 */

interface MathData {
  formula: string;
  displayMode: boolean;
}

export default class MathTool {
  static get toolbox() {
    return {
      title: 'Math',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><text x="4" y="18" font-family="serif" font-size="16" font-style="italic" fill="currentColor">∑</text></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: MathData;
  private wrapper: HTMLElement | null = null;
  private readOnly: boolean;
  private katexLoaded: boolean = false;

  constructor({ data, readOnly }: any) {
    this.data = {
      formula: data.formula || '',
      displayMode: data.displayMode !== false,
    };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-math-tool');
    this._renderMath();
    return this.wrapper;
  }

  private async _loadKaTeX(): Promise<void> {
    if (this.katexLoaded) return;
    // Load KaTeX CSS if not already loaded
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      document.head.appendChild(link);
    }
    this.katexLoaded = true;
  }

  private async _renderMath(): Promise<void> {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    // Preview area
    const preview = document.createElement('div');
    preview.classList.add('be-math-tool__preview');

    if (this.data.formula) {
      await this._loadKaTeX();
      try {
        const katex = await import('katex');
        katex.default.render(this.data.formula, preview, {
          displayMode: this.data.displayMode,
          throwOnError: false,
          output: 'html',
        });
      } catch {
        preview.textContent = this.data.formula;
        preview.classList.add('be-math-tool__preview--error');
      }
    } else {
      preview.innerHTML = '<span class="be-math-tool__placeholder">Click to enter formula</span>';
    }

    this.wrapper.appendChild(preview);

    // Editor (textarea)
    if (!this.readOnly) {
      const editorArea = document.createElement('div');
      editorArea.classList.add('be-math-tool__editor');

      const textarea = document.createElement('textarea');
      textarea.classList.add('be-math-tool__input');
      textarea.value = this.data.formula;
      textarea.placeholder = 'Enter LaTeX formula, e.g.: E = mc^2';
      textarea.rows = 2;

      let renderTimeout: ReturnType<typeof setTimeout>;
      textarea.addEventListener('input', () => {
        this.data.formula = textarea.value;
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => this._updatePreview(preview), 300);
      });

      editorArea.appendChild(textarea);

      // Display mode toggle
      const toggle = document.createElement('label');
      toggle.classList.add('be-math-tool__toggle');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.data.displayMode;
      checkbox.addEventListener('change', () => {
        this.data.displayMode = checkbox.checked;
        this._updatePreview(preview);
      });
      toggle.appendChild(checkbox);
      toggle.appendChild(document.createTextNode(' Display mode (block)'));
      editorArea.appendChild(toggle);

      this.wrapper.appendChild(editorArea);
    }
  }

  private async _updatePreview(preview: HTMLElement): Promise<void> {
    if (!this.data.formula) {
      preview.innerHTML = '<span class="be-math-tool__placeholder">Click to enter formula</span>';
      return;
    }
    await this._loadKaTeX();
    try {
      const katex = await import('katex');
      katex.default.render(this.data.formula, preview, {
        displayMode: this.data.displayMode,
        throwOnError: false,
        output: 'html',
      });
      preview.classList.remove('be-math-tool__preview--error');
    } catch {
      preview.textContent = this.data.formula;
      preview.classList.add('be-math-tool__preview--error');
    }
  }

  save(): MathData { return this.data; }
  validate(data: MathData): boolean { return !!data.formula; }
}
