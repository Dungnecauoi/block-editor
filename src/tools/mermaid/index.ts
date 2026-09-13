/**
 * MermaidTool — Mermaid diagram block for Editor.js
 */

interface MermaidData {
  code: string;
}

export default class MermaidTool {
  static get toolbox() {
    return {
      title: 'Mermaid',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M12 3v6m0 6v6M3 12h6m6 0h6"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="2"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: MermaidData;
  private wrapper: HTMLElement | null = null;
  private readOnly: boolean;

  constructor({ data, readOnly }: any) {
    this.data = { code: data.code || 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[OK]\n    B -->|No| D[Cancel]' };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-mermaid-tool');
    this._renderMermaid();
    return this.wrapper;
  }

  private async _renderMermaid(): Promise<void> {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    // Preview
    const preview = document.createElement('div');
    preview.classList.add('be-mermaid-tool__preview');

    try {
      const mermaid = await import('mermaid');
      mermaid.default.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
      const { svg } = await mermaid.default.render(id, this.data.code);
      preview.innerHTML = svg;
    } catch (err) {
      preview.innerHTML = `<div class="be-mermaid-tool__error">Diagram error: ${(err as Error).message}</div>`;
    }

    this.wrapper.appendChild(preview);

    // Code editor
    if (!this.readOnly) {
      const editor = document.createElement('div');
      editor.classList.add('be-mermaid-tool__editor');

      const textarea = document.createElement('textarea');
      textarea.classList.add('be-mermaid-tool__input');
      textarea.value = this.data.code;
      textarea.placeholder = 'Enter Mermaid diagram code...';
      textarea.rows = 6;

      let renderTimeout: ReturnType<typeof setTimeout>;
      textarea.addEventListener('input', () => {
        this.data.code = textarea.value;
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => this._updatePreview(preview), 500);
      });

      editor.appendChild(textarea);
      this.wrapper.appendChild(editor);
    }
  }

  private async _updatePreview(preview: HTMLElement): Promise<void> {
    try {
      const mermaid = await import('mermaid');
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
      const { svg } = await mermaid.default.render(id, this.data.code);
      preview.innerHTML = svg;
    } catch (err) {
      preview.innerHTML = `<div class="be-mermaid-tool__error">Diagram error: ${(err as Error).message}</div>`;
    }
  }

  save(): MermaidData { return this.data; }
  validate(data: MermaidData): boolean { return !!data.code; }
}
