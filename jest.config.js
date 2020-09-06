const fs = require('fs');
const setupFileExists = fs.existsSync('<rootDir>/test/.setup.js');

module.exports = (options = {}) => {
  return Object.assign({
    preset: 'ts-jest',
    testEnvironment: 'midway-bin/jest/env.js',
    testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
    coveragePathIgnorePatterns: ['<rootDir>/test/'],
    setupFiles: setupFileExists ? ['<rootDir>/test/.setup.js'] : [],
  }, options);
}
