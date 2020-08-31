module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'midway-bin/jest/env.js',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  // coveragePathIgnorePatterns: ['<rootDir>/test/fixtures'],
  setupFiles: ['<rootDir>/test/.setup.js'],
};
