const { transform } = require('@midwayjs/spec-builder');
const { existsSync } = require('fs');
const { join } = require('path');
export const loadSpec = (baseDir) => {
    const specPath = [
        'f.yml',
        'f.yaml',
        'serverless.yml',
        'serverless.yaml',
    ].find(spec => existsSync(join(baseDir, spec)));
    if (!specPath) {
        throw new Error('need yml config');
    }
    return transform(specPath);
};
