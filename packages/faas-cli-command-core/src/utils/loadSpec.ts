import { transform, saveYaml } from '@midwayjs/serverless-spec-builder';
import { existsSync } from 'fs';
import { resolve } from 'path';

export const getSpecFile = baseDir => {
  const specPath = [
    'f.yml',
    'f.yaml',
    'serverless.yml',
    'serverless.yaml',
  ].find(spec => existsSync(resolve(baseDir, spec)));
  if (specPath) {
    return {
      type: 'yaml',
      path: resolve(baseDir, specPath),
    };
  }
  return {};
};

export const loadSpec = baseDir => {
  const specFile = getSpecFile(baseDir);
  if (!specFile || !specFile.type) {
    return {};
  }
  if (specFile.type === 'yaml') {
    return transform(specFile.path);
  }
};

export const writeToSpec = (baseDir, specResult) => {
  const specFile = getSpecFile(baseDir);
  if (!specFile || !specFile.type) {
    return {};
  }
  if (specFile.type === 'yaml') {
    return saveYaml(specFile.path, specResult);
  }
};
