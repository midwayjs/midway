import { Readable } from 'stream';

export async function bufferFromStream(stream: Readable): Promise<Buffer> {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function safeJSONParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}
