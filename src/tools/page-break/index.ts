/**
 * PageBreakTool — Explicit page-break marker for print/PDF export
 */
export default class PageBreakTool {
  static get toolbox() {
    return {
      title: 'Page Break',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" stroke-dasharray="3 3" d="M3 12h18"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>',
    };
  }

  static get isReadOnlySupported() { return true; }

  private wrapper: HTMLElement | null = null;

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-page-break');
    this.wrapper.contentEditable = 'false';
    this.wrapper.innerHTML = '<span>Page Break</span>';
    return this.wrapper;
  }

  save(): Record<string, never> {
    return {};
  }

  validate(): boolean {
    return true;
  }
}
