import { InfoConfigOptions } from './interface';

export const DefaultHiddenKey = ['*secret*', 'pass*'];

export const info = {
  title: 'Midway Info',
  infoPath: '/_info',
  defaultHiddenKey: DefaultHiddenKey,
} as InfoConfigOptions;
