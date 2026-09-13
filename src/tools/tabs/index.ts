/**
 * TabsTool — Tabbed content block for Editor.js
 */

interface TabData {
  title: string;
  content: string;
}

interface TabsBlockData {
  tabs: TabData[];
  activeTab: number;
}

export default class TabsTool {
  static get toolbox() {
    return {
      title: 'Tabs',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M3 8h18M3 8V6a2 2 0 012-2h4l2 2h7a2 2 0 012 2M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private data: TabsBlockData;
  private wrapper: HTMLElement | null = null;
  private readOnly: boolean;
  private activeTab: number = 0;

  constructor({ data, readOnly }: any) {
    this.data = {
      tabs: data.tabs && data.tabs.length > 0 ? data.tabs : [{ title: 'Tab 1', content: '' }, { title: 'Tab 2', content: '' }],
      activeTab: data.activeTab || 0,
    };
    this.readOnly = readOnly;
    this.activeTab = this.data.activeTab;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-tabs-tool');
    this._renderTabs();
    return this.wrapper;
  }

  private _renderTabs(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';

    // Tab headers
    const headerRow = document.createElement('div');
    headerRow.classList.add('be-tabs-tool__headers');

    this.data.tabs.forEach((tab, index) => {
      const header = document.createElement('div');
      header.classList.add('be-tabs-tool__header');
      if (index === this.activeTab) header.classList.add('be-tabs-tool__header--active');

      if (!this.readOnly) {
        const titleInput = document.createElement('span');
        titleInput.contentEditable = 'true';
        titleInput.textContent = tab.title;
        titleInput.classList.add('be-tabs-tool__header-title');
        titleInput.addEventListener('input', () => { this.data.tabs[index].title = titleInput.textContent || ''; });
        titleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
        header.appendChild(titleInput);

        // Remove tab button (only if more than 1 tab)
        if (this.data.tabs.length > 1) {
          const removeBtn = document.createElement('span');
          removeBtn.classList.add('be-tabs-tool__remove');
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.data.tabs.splice(index, 1);
            if (this.activeTab >= this.data.tabs.length) this.activeTab = this.data.tabs.length - 1;
            this._renderTabs();
          });
          header.appendChild(removeBtn);
        }
      } else {
        header.textContent = tab.title;
      }

      header.addEventListener('click', () => {
        this.activeTab = index;
        this._renderTabs();
      });

      headerRow.appendChild(header);
    });

    // Add tab button
    if (!this.readOnly) {
      const addBtn = document.createElement('div');
      addBtn.classList.add('be-tabs-tool__add');
      addBtn.textContent = '+';
      addBtn.addEventListener('click', () => {
        this.data.tabs.push({ title: `Tab ${this.data.tabs.length + 1}`, content: '' });
        this.activeTab = this.data.tabs.length - 1;
        this._renderTabs();
      });
      headerRow.appendChild(addBtn);
    }

    this.wrapper.appendChild(headerRow);

    // Tab content
    const contentArea = document.createElement('div');
    contentArea.classList.add('be-tabs-tool__content');
    if (!this.readOnly) {
      contentArea.contentEditable = 'true';
      contentArea.setAttribute('data-placeholder', 'Tab content...');
      contentArea.addEventListener('input', () => {
        this.data.tabs[this.activeTab].content = contentArea.innerHTML;
      });
    }
    contentArea.innerHTML = this.data.tabs[this.activeTab]?.content || '';

    this.wrapper.appendChild(contentArea);
  }

  save(): TabsBlockData {
    return { ...this.data, activeTab: this.activeTab };
  }

  validate(data: TabsBlockData): boolean {
    return data.tabs.length > 0;
  }
}
