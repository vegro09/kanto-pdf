declare module 'mammoth' {
  export interface ConvertResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function convertToHtml(input: {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }, options?: Record<string, unknown>): Promise<ConvertResult>;

  export function extractRawText(input: {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }): Promise<ConvertResult>;
}
