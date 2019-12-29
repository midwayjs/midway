const { transform } = require('@midwayjs/spec-builder');
const { existsSync } = require('fs');
const { resolve } = require('path');
export const loadSpec = baseDir => {
  const specPath = [
    'f.yml',
    'f.yaml',
    'serverless.yml',
    'serverless.yaml',
  ].find(spec => existsSync(resolve(baseDir, spec)));
  if (!specPath) {
    return {};
  }
  return transform(resolve(baseDir, specPath));
};
