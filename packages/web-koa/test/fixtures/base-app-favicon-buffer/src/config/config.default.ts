import { readFileSync } from 'fs';
import { join } from 'path';

export const keys = 'key';

export const siteFile = {
  favicon: readFileSync(join(__dirname, '../static/favicon.ico')),
};
