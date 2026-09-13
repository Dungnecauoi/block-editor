/**
 * Default tools configuration for @duxbo/block-editor
 * Maps all available tools with their default settings
 */
import type { UploadAdapter } from '../types';

// ============================================================
// Helper: create upload endpoints config from adapter or URL
// ============================================================

export function createUploadConfig(
  adapter?: UploadAdapter,
  endpoint?: string,
) {
  if (adapter) {
    return {
      uploader: {
        uploadByFile: adapter.uploadByFile.bind(adapter),
        uploadByUrl: adapter.uploadByUrl
          ? adapter.uploadByUrl.bind(adapter)
          : undefined,
      },
    };
  }

  if (endpoint) {
    return {
      endpoints: {
        byFile: endpoint,
        byUrl: endpoint,
      },
    };
  }

  return {};
}

// ============================================================
// Build all tool configurations
// ============================================================

export function buildToolsConfig(options: {
  uploadAdapter?: UploadAdapter;
  uploadEndpoint?: string;
}) {
  const uploadConfig = createUploadConfig(
    options.uploadAdapter,
    options.uploadEndpoint,
  );

  return {
    // ---- Text & Typography ----
    paragraph: {
      module: () => import('@editorjs/paragraph'),
      config: {
        placeholder: 'Type or paste your text here...',
        preserveBlank: true,
      },
      inlineToolbar: true,
    },

    header: {
      module: () => import('@editorjs/header'),
      config: {
        placeholder: 'Enter a heading',
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 2,
      },
      inlineToolbar: true,
    },

    quote: {
      module: () => import('@editorjs/quote'),
      config: {
        quotePlaceholder: 'Enter a quote',
        captionPlaceholder: 'Quote author',
      },
      inlineToolbar: true,
    },

    warning: {
      module: () => import('@editorjs/warning'),
      config: {
        titlePlaceholder: 'Title',
        messagePlaceholder: 'Message',
      },
      inlineToolbar: true,
    },

    delimiter: {
      module: () => import('@editorjs/delimiter'),
    },

    alert: {
      module: () => import('editorjs-alert'),
      config: {
        defaultType: 'primary',
        messagePlaceholder: 'Enter alert text',
      },
      inlineToolbar: true,
    },

    toggle: {
      module: () => import('editorjs-toggle-block'),
      config: {
        placeholder: 'Toggle title',
      },
      inlineToolbar: true,
    },

    // ---- Lists ----
    list: {
      module: () => import('@editorjs/nested-list'),
      config: {
        defaultStyle: 'unordered',
      },
      inlineToolbar: true,
    },

    checklist: {
      module: () => import('@editorjs/checklist'),
      inlineToolbar: true,
    },

    // ---- Media & Embed ----
    image: {
      module: () => import('@editorjs/image'),
      config: {
        captionPlaceholder: 'Image caption',
        ...uploadConfig,
      },
    },

    simpleImage: {
      module: () => import('@editorjs/simple-image'),
    },

    linkTool: {
      module: () => import('@editorjs/link'),
      config: {
        endpoint: options.uploadEndpoint
          ? options.uploadEndpoint.replace(/upload/i, 'fetchUrl')
          : undefined,
      },
    },

    attaches: {
      module: () => import('@editorjs/attaches'),
      config: {
        ...uploadConfig,
      },
    },

    embed: {
      module: () => import('@editorjs/embed'),
      config: {
        services: {
          youtube: true,
          vimeo: true,
          codepen: true,
          github: true,
          twitter: true,
          instagram: true,
          facebook: true,
          pinterest: true,
          coub: true,
        },
      },
      inlineToolbar: true,
    },

    // ---- Table ----
    table: {
      module: () => import('@editorjs/table'),
      config: {
        rows: 3,
        cols: 3,
        withHeadings: true,
      },
      inlineToolbar: true,
    },

    // ---- Code ----
    code: {
      module: () => import('@calumk/editorjs-codeflask'),
    },

    raw: {
      module: () => import('@editorjs/raw'),
      config: {
        placeholder: 'Enter raw HTML code',
      },
    },

    // ---- Layout ----
    columns: {
      module: () => import('@calumk/editorjs-columns'),
      config: {
        EditorJsLibrary: null, // will be set at runtime
      },
    },

    // ---- Button ----
    button: {
      module: () => import('editorjs-button'),
      config: {
        css: {
          btnColor: '#3b82f6',
        },
      },
      inlineToolbar: false,
    },
  };
}

// ============================================================
// Inline tools config
// ============================================================

export function buildInlineToolsConfig() {
  return {
    marker: {
      module: () => import('@editorjs/marker'),
    },
    inlineCode: {
      module: () => import('@editorjs/inline-code'),
    },
    underline: {
      module: () => import('@editorjs/underline'),
    },
    hyperlink: {
      module: () => import('editorjs-hyperlink'),
      config: {
        shortcut: 'CMD+L',
        target: '_blank',
        rel: 'nofollow',
        availableTargets: ['_blank', '_self'],
        availableRels: ['nofollow', 'noreferrer'],
      },
    },
    Color: {
      module: () => import('editorjs-text-color-plugin'),
      config: {
        colorCollections: [
          '#EC7878', '#9C27B0', '#673AB7', '#3F51B5',
          '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50',
          '#8BC34A', '#CDDC39', '#FFF', '#FF9800',
          '#FF5722', '#795548', '#607D8B', '#000000',
        ],
        defaultColor: '#FF1300',
        type: 'text',
        customPicker: true,
      },
    },
    Marker: {
      module: () => import('editorjs-text-color-plugin'),
      config: {
        defaultColor: '#FFBF00',
        type: 'marker',
        customPicker: true,
      },
    },
    changeCase: {
      module: () => import('editorjs-change-case'),
    },
    tooltip: {
      module: () => import('editorjs-tooltip'),
      config: {
        location: 'bottom',
        underline: true,
        placeholder: 'Enter a tooltip',
        highlightColor: '#FFEFD5',
        backgroundColor: '#154360',
        textColor: '#FDFEFE',
      },
    },
  };
}

// ============================================================
// Block tunes config
// ============================================================

export function buildTunesConfig() {
  return {
    textVariant: {
      module: () => import('@editorjs/text-variant-tune'),
    },
    alignmentTune: {
      module: () => import('editorjs-text-alignment-blocktune'),
      config: {
        default: 'left',
        blocks: {
          header: 'center',
        },
      },
    },
    indentTune: {
      module: () => import('editorjs-indent-tune'),
      config: {
        indentSize: 24,
        maxIndent: 5,
        direction: 'ltr',
        handleShortcut: true,
      },
    },
  };
}
