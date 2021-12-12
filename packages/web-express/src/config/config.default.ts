import {
  Options,
  OptionsJson,
  OptionsText,
  OptionsUrlencoded,
} from 'body-parser';

export const bodyParser: {
  enable?: boolean;
  json?: OptionsJson & {
    enable?: boolean;
  };
  raw?: Options & {
    enable?: boolean;
  };
  text?: OptionsText & {
    enable?: boolean;
  };
  urlencoded?: OptionsUrlencoded & {
    enable?: boolean;
  };
} = {
  enable: true,
  json: {
    enable: true,
    limit: '1mb',
    strict: true,
  },
  raw: {
    enable: false,
    limit: '1mb',
  },
  text: {
    enable: true,
    limit: '1mb',
  },
  urlencoded: {
    enable: true,
    extended: false,
    limit: '1mb',
    parameterLimit: 1000,
  },
};
