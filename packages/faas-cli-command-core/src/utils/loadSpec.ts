import { transform, saveYaml } from '@midwayjs/serverless-spec-builder';
import { existsSync } from 'fs';
import { resolve } from 'path';

export const getSpecFile = baseDir => {
  baseDir = baseDir || process.cwd();
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

export const loadSpec = (baseDir, specFileInfo?) => {
  const specFile = specFileInfo || getSpecFile(baseDir);
  if (!specFile || !specFile.type) {
    return {};
  }
  if (specFile.type === 'yaml') {
    return transform(specFile.path);
  }
};

export const writeToSpec = (baseDir, specResult, specFileInfo?) => {
  const specFile = specFileInfo || getSpecFile(baseDir);
  if (!specFile || !specFile.type) {
    return {};
  }
  if (specFile.type === 'yaml') {
    return saveYaml(specFile.path, specResult);
  }
};
