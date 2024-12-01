import { createApp, createFunctionApp } from './creator';

export async function createAppWithDefaultDetector<T>(...args: Parameters<typeof createApp>): Promise<T> {
  return createApp(...args);
}

export async function createFunctionAppWithDefaultDetector<T>(...args: Parameters<typeof createFunctionApp>): Promise<T> {
  return createFunctionApp(...args);
}
