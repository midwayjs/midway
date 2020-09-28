const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  setupFilesAfterEnv: [path.join(__dirname, 'test/.setup.js')],
};
