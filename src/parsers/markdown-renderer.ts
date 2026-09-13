/**
 * Markdown Renderer — Converts Editor.js JSON output to Markdown
 */
import type { OutputData, OutputBlockData } from '../types';

export function renderToMarkdown(data: OutputData): string {
  if (!data || !data.blocks) return '';
  return data.blocks.map(block => renderBlockMd(block)).filter(Boolean).join('\n\n');
}

function renderBlockMd(block: OutputBlockData): string {
  const d = block.data as any;

  switch (block.type) {
    case 'paragraph':
      return stripHtml(d.text || '');

    case 'header':
      return `${'#'.repeat(d.level || 2)} ${stripHtml(d.text || '')}`;

    case 'list': {
      const ordered = d.style === 'ordered' || d.type === 'ordered';
      return (d.items || []).map((item: any, i: number) => {
        const text = typeof item === 'string' ? item : item.content || item.text || '';
        return ordered ? `${i + 1}. ${stripHtml(text)}` : `- ${stripHtml(text)}`;
      }).join('\n');
    }

    case 'checklist':
      return (d.items || []).map((item: any) =>
        `- [${item.checked ? 'x' : ' '}] ${stripHtml(item.text || '')}`
      ).join('\n');

    case 'quote':
      return `> ${stripHtml(d.text || '')}${d.caption ? `\n> — *${stripHtml(d.caption)}*` : ''}`;

    case 'warning':
      return `> ⚠️ **${stripHtml(d.title || '')}**\n> ${stripHtml(d.message || '')}`;

    case 'delimiter':
      return '---';

    case 'alert':
      return `> **${(d.type || 'info').toUpperCase()}**: ${stripHtml(d.message || '')}`;

    case 'image':
      return `![${stripHtml(d.caption || '')}](${d.file?.url || d.url || ''})`;

    case 'code':
      return `\`\`\`\n${d.code || d.text || ''}\n\`\`\``;

    case 'raw':
      return `\`\`\`html\n${d.html || ''}\n\`\`\``;

    case 'table': {
      if (!d.content || d.content.length === 0) return '';
      const rows = d.content as string[][];
      const header = rows[0].map((c: string) => stripHtml(c));
      const divider = header.map(() => '---');
      const body = rows.slice(1).map((row: string[]) => row.map((c: string) => stripHtml(c)));
      return [
        `| ${header.join(' | ')} |`,
        `| ${divider.join(' | ')} |`,
        ...body.map((row: string[]) => `| ${row.join(' | ')} |`),
      ].join('\n');
    }

    case 'attaches':
      return `📎 [${d.title || d.file?.name || 'Download'}](${d.file?.url || ''})`;

    case 'linkTool':
      return `[${d.meta?.title || d.link || 'Link'}](${d.link || ''})`;

    case 'embed':
      return `[${d.caption || 'Embedded content'}](${d.source || d.embed || ''})`;

    case 'video':
      return `🎬 [${d.caption || 'Video'}](${d.url || ''})`;

    case 'audio':
      return `🎵 [${d.title || 'Audio'}](${d.url || ''})`;

    case 'gallery':
      return (d.images || []).map((img: any) => `![${img.caption || ''}](${img.url})`).join('\n');

    case 'tabs':
      return (d.tabs || []).map((tab: any) => `### ${tab.title}\n${stripHtml(tab.content || '')}`).join('\n\n');

    case 'math':
      return d.displayMode ? `$$\n${d.formula || ''}\n$$` : `$${d.formula || ''}$`;

    case 'mermaid':
      return `\`\`\`mermaid\n${d.code || ''}\n\`\`\``;

    case 'drawing':
      return d.dataUrl ? `![Drawing](${d.dataUrl})` : '';

    case 'iframe':
      return `🪟 [Iframe](${d.url || ''})`;

    case 'map':
      return `🗺 Location: ${d.lat}, ${d.lng}`;

    case 'socialEmbed':
      return `📱 [Social post](${d.url || ''})`;

    case 'button':
      return `[${d.text || 'Button'}](${d.link || '#'})`;

    case 'toggle':
      return `<details>\n<summary>${stripHtml(d.text || 'Toggle')}</summary>\n\n${(d.items || []).map((i: string) => stripHtml(i)).join('\n')}\n</details>`;

    default:
      return '';
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '$1')
    .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<mark[^>]*>(.*?)<\/mark>/gi, '==$1==')
    .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '');
}
