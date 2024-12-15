module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['./hack.js', './jest.setup.js'],
  coverageProvider: 'v8',
};
