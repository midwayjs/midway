import { INunjucksConfig } from '../interface';

export default {
  nunjucks: {
    autoescape: true,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false,
    cache: true,
  },
} as {
  nunjucks: INunjucksConfig;
};
