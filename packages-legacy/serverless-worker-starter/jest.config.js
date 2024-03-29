module.exports = {
  preset: 'ts-jest',
  testEnvironment: '@midwayjs/jest-environment-service-worker',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  coverageProvider: 'v8',
};
