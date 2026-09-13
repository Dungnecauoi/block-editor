/**
 * HTML Renderer — Converts Editor.js JSON output to semantic HTML
 */
import type { OutputData, OutputBlockData } from '../types';
import { slugify } from '../utils/slugify';

export function renderToHTML(data: OutputData): string {
  if (!data || !data.blocks) return '';
  const usedSlugs = new Set<string>();
  return data.blocks.map(block => renderBlock(block, usedSlugs)).join('\n');
}

function renderBlock(block: OutputBlockData, usedSlugs: Set<string>): string {
  const d = block.data as any;

  switch (block.type) {
    case 'paragraph':
      return `<p>${d.text || ''}</p>`;

    case 'header': {
      const level = d.level || 2;
      const id = slugify(d.text || '', usedSlugs);
      return `<h${level} id="${id}">${d.text || ''}</h${level}>`;
    }

    case 'list': {
      const tag = d.style === 'ordered' || d.type === 'ordered' ? 'ol' : 'ul';
      const items = (d.items || []).map((item: any) => {
        const content = typeof item === 'string' ? item : item.content || item.text || '';
        return `<li>${content}</li>`;
      }).join('');
      return `<${tag}>${items}</${tag}>`;
    }

    case 'checklist': {
      const items = (d.items || []).map((item: any) => {
        const checked = item.checked ? 'checked' : '';
        return `<li><input type="checkbox" ${checked} disabled> ${item.text || ''}</li>`;
      }).join('');
      return `<ul class="checklist">${items}</ul>`;
    }

    case 'quote':
      return `<blockquote><p>${d.text || ''}</p>${d.caption ? `<cite>${d.caption}</cite>` : ''}</blockquote>`;

    case 'warning':
      return `<div class="warning"><strong>${d.title || ''}</strong><p>${d.message || ''}</p></div>`;

    case 'delimiter':
      return '<hr>';

    case 'alert':
      return `<div class="alert alert-${d.type || 'info'}">${d.message || ''}</div>`;

    case 'image':
      return `<figure>${d.file?.url ? `<img src="${d.file.url}" alt="${d.caption || ''}"${d.stretched ? ' class="stretched"' : ''}>` : ''}${d.caption ? `<figcaption>${d.caption}</figcaption>` : ''}</figure>`;

    case 'embed':
      return `<div class="embed"><iframe src="${d.embed || d.source || ''}" width="${d.width || '100%'}" height="${d.height || 320}" frameborder="0" allowfullscreen></iframe>${d.caption ? `<p class="embed-caption">${d.caption}</p>` : ''}</div>`;

    case 'table': {
      const rows = (d.content || []).map((row: string[], rowIndex: number) => {
        const cellTag = d.withHeadings && rowIndex === 0 ? 'th' : 'td';
        const cells = row.map(cell => `<${cellTag}>${cell}</${cellTag}>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table>${rows}</table>`;
    }

    case 'code':
      return `<pre><code>${d.code || d.text || ''}</code></pre>`;

    case 'raw':
      return d.html || '';

    case 'attaches':
      return `<a href="${d.file?.url || ''}" class="attachment" download>${d.title || d.file?.name || 'Download'} (${_formatBytes(d.file?.size)})</a>`;

    case 'linkTool':
      return `<a href="${d.link || ''}" class="link-preview" target="_blank">${d.meta?.title || d.link || ''}</a>`;

    case 'video':
      if (d.service === 'youtube' || d.service === 'vimeo') {
        return `<div class="video-embed"><iframe src="${d.url}" frameborder="0" allowfullscreen></iframe>${d.caption ? `<p>${d.caption}</p>` : ''}</div>`;
      }
      return `<figure><video src="${d.url}" controls${d.autoplay ? ' autoplay' : ''}${d.muted ? ' muted' : ''}></video>${d.caption ? `<figcaption>${d.caption}</figcaption>` : ''}</figure>`;

    case 'audio':
      return `<figure><audio src="${d.url}" controls></audio>${d.title ? `<figcaption>${d.title}</figcaption>` : ''}</figure>`;

    case 'gallery': {
      const imgs = (d.images || []).map((img: any) => `<img src="${img.url}" alt="${img.caption || ''}" loading="lazy">`).join('');
      return `<div class="gallery" style="display:grid;grid-template-columns:repeat(${d.columns || 3},1fr);gap:8px;">${imgs}</div>`;
    }

    case 'tabs': {
      const headers = (d.tabs || []).map((t: any, i: number) => `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${i}">${t.title}</button>`).join('');
      const panels = (d.tabs || []).map((t: any, i: number) => `<div class="tab-panel${i === 0 ? ' active' : ''}" data-panel="${i}">${t.content}</div>`).join('');
      return `<div class="tabs"><div class="tab-headers">${headers}</div>${panels}</div>`;
    }

    case 'math':
      return `<div class="math-block" data-formula="${_escapeAttr(d.formula || '')}">${d.formula || ''}</div>`;

    case 'mermaid':
      return `<div class="mermaid">${d.code || ''}</div>`;

    case 'drawing':
      return d.dataUrl ? `<img src="${d.dataUrl}" alt="Drawing" class="drawing">` : '';

    case 'iframe':
      return `<iframe src="${d.url || ''}" width="${d.width || '100%'}" height="${d.height || '400px'}" frameborder="0" sandbox="allow-scripts allow-same-origin"></iframe>`;

    case 'map':
      return `<div class="map-embed"><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${(d.lng || 0) - 0.05},${(d.lat || 0) - 0.03},${(d.lng || 0) + 0.05},${(d.lat || 0) + 0.03}&marker=${d.lat},${d.lng}" width="100%" height="350" frameborder="0"></iframe></div>`;

    case 'socialEmbed':
      return `<div class="social-embed"><a href="${d.url || ''}" target="_blank">${d.url || ''}</a></div>`;

    case 'button':
      return `<a href="${d.link || '#'}" class="btn">${d.text || 'Button'}</a>`;

    case 'toggle':
      return `<details><summary>${d.text || 'Toggle'}</summary><div>${(d.items || []).join('')}</div></details>`;

    case 'pageBreak':
      return '<div class="page-break" style="page-break-after: always;"></div>';

    case 'qrcode':
      return `<div class="qrcode" data-text="${_escapeAttr(d.text || '')}">${d.text || ''}</div>`;

    case 'signature':
      return d.dataUrl ? `<img src="${d.dataUrl}" alt="Signature" class="signature">` : '';

    case 'chart': {
      const rows = (d.rows || []).map((r: any) => `<tr><td>${r.label}</td><td>${r.value}</td></tr>`).join('');
      return `<div class="chart" data-chart-type="${d.chartType || 'bar'}">${d.title ? `<h4>${d.title}</h4>` : ''}<table>${rows}</table></div>`;
    }

    default:
      return `<!-- Unknown block type: ${block.type} -->`;
  }
}

function _formatBytes(bytes: number | undefined): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function _escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
