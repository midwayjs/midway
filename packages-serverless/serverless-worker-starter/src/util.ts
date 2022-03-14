import { Readable } from 'stream';

export const isWorkerEnvironment =
  typeof ServiceWorkerGlobalScope === 'function' &&
  globalThis instanceof ServiceWorkerGlobalScope;

export function getWorkerContext(entryReq) {
  return isWorkerEnvironment ? globalThis.Alinode : entryReq[0];
}

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

export function isString(value) {
  return typeof value === 'string' || value instanceof String;
}
