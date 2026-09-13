/**
 * MapTool — Map embed block for Editor.js (OpenStreetMap)
 */
interface MapData { lat: number; lng: number; zoom: number; caption: string; }

export default class MapTool {
  static get toolbox() {
    return {
      title: 'Map',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21s-6-5.686-6-10A6 6 0 0118 11c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2" stroke="currentColor" stroke-width="2"/></svg>',
    };
  }
  static get isReadOnlySupported() { return true; }

  private data: MapData;
  private wrapper: HTMLElement | null = null;
  private readOnly: boolean;

  constructor({ data, readOnly }: any) {
    this.data = { lat: data.lat || 10.7769, lng: data.lng || 106.7009, zoom: data.zoom || 13, caption: data.caption || '' };
    this.readOnly = readOnly;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('be-map-tool');

    const container = document.createElement('div');
    container.classList.add('be-map-tool__container');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${this.data.lng - 0.05},${this.data.lat - 0.03},${this.data.lng + 0.05},${this.data.lat + 0.03}&layer=mapnik&marker=${this.data.lat},${this.data.lng}`;
    iframe.style.width = '100%';
    iframe.style.height = '350px';
    iframe.setAttribute('frameborder', '0');
    container.appendChild(iframe);
    this.wrapper.appendChild(container);

    if (!this.readOnly) {
      const controls = document.createElement('div');
      controls.classList.add('be-map-tool__controls');
      controls.innerHTML = `
        <input type="number" step="any" class="be-map-tool__coord" placeholder="Latitude" value="${this.data.lat}" data-field="lat">
        <input type="number" step="any" class="be-map-tool__coord" placeholder="Longitude" value="${this.data.lng}" data-field="lng">
      `;
      controls.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
          const field = input.getAttribute('data-field') as 'lat' | 'lng';
          (this.data as any)[field] = parseFloat(input.value);
          iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${this.data.lng - 0.05},${this.data.lat - 0.03},${this.data.lng + 0.05},${this.data.lat + 0.03}&layer=mapnik&marker=${this.data.lat},${this.data.lng}`;
        });
      });
      this.wrapper.appendChild(controls);
    }

    return this.wrapper;
  }

  save(): MapData { return this.data; }
  validate(data: MapData): boolean { return typeof data.lat === 'number' && typeof data.lng === 'number'; }
}
