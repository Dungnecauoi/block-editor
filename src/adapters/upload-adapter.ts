/**
 * Upload Adapter — Base upload interface and fetch-based adapter
 */
import type { UploadAdapter, UploadResponse } from '../types';

/**
 * Simple fetch-based upload adapter
 * Sends file as multipart/form-data to the given endpoint
 */
export class FetchUploadAdapter implements UploadAdapter {
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(endpoint: string, headers: Record<string, string> = {}) {
    this.endpoint = endpoint;
    this.headers = headers;
  }

  async uploadByFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: formData,
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize response format
    return {
      success: !!(data.success || data.file?.url || data.url),
      file: {
        url: data.file?.url || data.url || data.location || '',
        name: data.file?.name || file.name,
        size: data.file?.size || file.size,
        extension: file.name.split('.').pop() || '',
      },
    };
  }

  async uploadByUrl(url: string): Promise<UploadResponse> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Upload by URL failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: !!(data.success || data.file?.url || data.url),
      file: {
        url: data.file?.url || data.url || '',
        name: data.file?.name || '',
      },
    };
  }
}
