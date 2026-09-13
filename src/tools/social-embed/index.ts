/**
 * SocialEmbedTool — Social media embed block for Editor.js
 * Supports: Twitter/X, Instagram, Facebook, TikTok, LinkedIn
 */
interface SocialEmbedData { url: string; platform: string; html: string; }

export default class SocialEmbedTool {
  static get toolbox() {
    return {
      title: 'Social Embed',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8A3 3 0 1018 14 3 3 0 1018 8zM6 15A3 3 0 106 21 3 3 0 106 15zM6 3A3 3 0 106 9 3 3 0 106 3z"/><line x1="8.59" y1="7.51" x2="15.42" y2="9.49" stroke="currentColor" stroke-width="2"/><line x1="15.41" y1="12.51" x2="8.59" y2="16.49" stroke="currentColor" stroke-width="2"/></svg>',
    };
  }
  static get isReadOnlySupported() { return true; }

  private data: SocialEmbedData;
  private wrapper: HTMLElement | null = null;
  private readOnly: boolean;

  constructor({ data, readOnly }: any) {
    this.data = { url: data.url || '', platform: data.platform || '', html: data.html || '' };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-social-tool');
    if (this.data.url) { this._renderEmbed(); } else { this._renderInput(); }
    return this.wrapper;
  }

  private _detectPlatform(url: string): string {
    if (/twitter\.com|x\.com/i.test(url)) return 'twitter';
    if (/instagram\.com/i.test(url)) return 'instagram';
    if (/facebook\.com|fb\.com/i.test(url)) return 'facebook';
    if (/tiktok\.com/i.test(url)) return 'tiktok';
    if (/linkedin\.com/i.test(url)) return 'linkedin';
    return 'unknown';
  }

  private _renderEmbed(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';
    const container = document.createElement('div');
    container.classList.add('be-social-tool__embed');

    const platform = this._detectPlatform(this.data.url);
    this.data.platform = platform;

    if (platform === 'twitter') {
      container.innerHTML = `<blockquote class="twitter-tweet"><a href="${this.data.url}"></a></blockquote>`;
      this._loadScript('https://platform.twitter.com/widgets.js');
    } else if (platform === 'instagram') {
      container.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${this.data.url}"></blockquote>`;
      this._loadScript('https://www.instagram.com/embed.js');
    } else {
      // Fallback: render as link card
      container.innerHTML = `
        <div class="be-social-tool__card">
          <div class="be-social-tool__card-icon">${platform.toUpperCase()}</div>
          <a href="${this.data.url}" target="_blank" rel="noopener noreferrer" class="be-social-tool__card-link">${this.data.url}</a>
        </div>
      `;
    }

    this.wrapper.appendChild(container);
  }

  private _renderInput(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('be-social-tool__input');
    input.placeholder = 'Paste social media URL (Twitter, Instagram, Facebook, TikTok...)';
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.data.url = input.value.trim();
        if (this.data.url) this._renderEmbed();
      }
    });
    this.wrapper.appendChild(input);
  }

  private _loadScript(src: string): void {
    if (document.querySelector(`script[src="${src}"]`)) {
      // Re-process
      (window as any).twttr?.widgets?.load();
      (window as any).instgrm?.Embeds?.process();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }

  save(): SocialEmbedData { return this.data; }
  validate(data: SocialEmbedData): boolean { return !!data.url; }
}
