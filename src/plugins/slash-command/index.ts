/**
 * SlashCommandPlugin — "/" menu to quickly insert blocks
 * Attaches to the Editor.js instance and listens for "/" keypress
 */

interface SlashMenuItem {
  title: string;
  icon: string;
  description: string;
  toolName: string;
}

export default class SlashCommandPlugin {
  private editor: any;
  private menu: HTMLElement | null = null;
  private items: SlashMenuItem[] = [];
  private filteredItems: SlashMenuItem[] = [];
  private activeIndex = 0;
  private isOpen = false;
  private searchQuery = '';

  constructor(editor: any) {
    this.editor = editor;
    this._buildItems();
  }

  private _buildItems(): void {
    this.items = [
      { title: 'Text', icon: '¶', description: 'Plain text paragraph', toolName: 'paragraph' },
      { title: 'Heading 1', icon: 'H1', description: 'Large heading', toolName: 'header' },
      { title: 'Heading 2', icon: 'H2', description: 'Medium heading', toolName: 'header' },
      { title: 'Heading 3', icon: 'H3', description: 'Small heading', toolName: 'header' },
      { title: 'List', icon: '•', description: 'Bulleted or numbered list', toolName: 'list' },
      { title: 'Checklist', icon: '☑', description: 'Task checklist', toolName: 'checklist' },
      { title: 'Quote', icon: '"', description: 'Block quote', toolName: 'quote' },
      { title: 'Warning', icon: '⚠', description: 'Warning notice', toolName: 'warning' },
      { title: 'Alert', icon: '🔔', description: 'Alert notification', toolName: 'alert' },
      { title: 'Code', icon: '<>', description: 'Code with highlighting', toolName: 'code' },
      { title: 'Table', icon: '▦', description: 'Data table', toolName: 'table' },
      { title: 'Image', icon: '🖼', description: 'Upload or paste image', toolName: 'image' },
      { title: 'Video', icon: '🎬', description: 'Video or YouTube embed', toolName: 'video' },
      { title: 'Audio', icon: '🎵', description: 'Audio player', toolName: 'audio' },
      { title: 'Gallery', icon: '🏞', description: 'Image gallery', toolName: 'gallery' },
      { title: 'Embed', icon: '🔗', description: 'YouTube, Vimeo, CodePen', toolName: 'embed' },
      { title: 'File', icon: '📎', description: 'File attachment', toolName: 'attaches' },
      { title: 'Tabs', icon: '📑', description: 'Tabbed content', toolName: 'tabs' },
      { title: 'Math', icon: '∑', description: 'LaTeX formula', toolName: 'math' },
      { title: 'Mermaid', icon: '📊', description: 'Mermaid diagram', toolName: 'mermaid' },
      { title: 'Drawing', icon: '✏️', description: 'Freehand drawing', toolName: 'drawing' },
      { title: 'Iframe', icon: '🪟', description: 'Embed any webpage', toolName: 'iframe' },
      { title: 'Map', icon: '🗺', description: 'Map location', toolName: 'map' },
      { title: 'Social', icon: '📱', description: 'Social media embed', toolName: 'socialEmbed' },
      { title: 'Button', icon: '🔘', description: 'Call-to-action button', toolName: 'button' },
      { title: 'Delimiter', icon: '—', description: 'Visual separator', toolName: 'delimiter' },
      { title: 'Toggle', icon: '▶', description: 'Collapsible block', toolName: 'toggle' },
      { title: 'Columns', icon: '▥', description: 'Multi-column layout', toolName: 'columns' },
      { title: 'Raw HTML', icon: '🏷', description: 'Raw HTML block', toolName: 'raw' },
    ];
    this.filteredItems = [...this.items];
  }

  attach(): void {
    const editorEl = typeof this.editor.configuration?.holder === 'string'
      ? document.getElementById(this.editor.configuration.holder)
      : this.editor.configuration?.holder;

    if (!editorEl) return;

    editorEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.isOpen) {
        this._handleMenuKeydown(e);
        return;
      }
    });

    editorEl.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || !target.textContent) return;

      const text = target.textContent;
      if (text === '/') {
        this._openMenu(target);
      } else if (this.isOpen && text.startsWith('/')) {
        this.searchQuery = text.substring(1).toLowerCase();
        this._filterItems();
      } else if (this.isOpen) {
        this._closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && this.menu && !this.menu.contains(e.target as Node)) {
        this._closeMenu();
      }
    });
  }

  private _openMenu(anchorEl: HTMLElement): void {
    this._closeMenu();
    this.isOpen = true;
    this.activeIndex = 0;
    this.searchQuery = '';
    this.filteredItems = [...this.items];

    this.menu = document.createElement('div');
    this.menu.classList.add('be-slash-menu');
    this._renderMenuItems();

    const rect = anchorEl.getBoundingClientRect();
    this.menu.style.position = 'fixed';
    this.menu.style.left = `${rect.left}px`;
    this.menu.style.top = `${rect.bottom + 4}px`;
    this.menu.style.zIndex = '10000';

    document.body.appendChild(this.menu);
  }

  private _closeMenu(): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
    this.isOpen = false;
    this.searchQuery = '';
  }

  private _filterItems(): void {
    this.filteredItems = this.items.filter(item =>
      item.title.toLowerCase().includes(this.searchQuery) ||
      item.description.toLowerCase().includes(this.searchQuery)
    );
    this.activeIndex = 0;
    if (this.menu) this._renderMenuItems();
  }

  private _renderMenuItems(): void {
    if (!this.menu) return;
    this.menu.innerHTML = '';

    if (this.filteredItems.length === 0) {
      this.menu.innerHTML = '<div class="be-slash-menu__empty">No blocks found</div>';
      return;
    }

    this.filteredItems.forEach((item, index) => {
      const el = document.createElement('div');
      el.classList.add('be-slash-menu__item');
      if (index === this.activeIndex) el.classList.add('be-slash-menu__item--active');
      el.innerHTML = `
        <span class="be-slash-menu__icon">${item.icon}</span>
        <div class="be-slash-menu__text">
          <span class="be-slash-menu__title">${item.title}</span>
          <span class="be-slash-menu__desc">${item.description}</span>
        </div>
      `;
      el.addEventListener('click', () => this._selectItem(index));
      el.addEventListener('mouseenter', () => {
        this.activeIndex = index;
        this._renderMenuItems();
      });
      this.menu!.appendChild(el);
    });
  }

  private _handleMenuKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.filteredItems.length;
      this._renderMenuItems();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
      this._renderMenuItems();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this._selectItem(this.activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._closeMenu();
    }
  }

  private async _selectItem(index: number): Promise<void> {
    const item = this.filteredItems[index];
    if (!item) return;

    this._closeMenu();

    // Clear the "/" text from current block
    const currentBlockIndex = this.editor.blocks.getCurrentBlockIndex();
    if (currentBlockIndex >= 0) {
      this.editor.blocks.delete(currentBlockIndex);
    }

    // Insert the selected block
    const blockData: any = { type: item.toolName, data: {} };
    if (item.toolName === 'header') {
      const level = item.title.includes('1') ? 1 : item.title.includes('2') ? 2 : 3;
      blockData.data = { level };
    }

    this.editor.blocks.insert(item.toolName, blockData.data);
  }
}
