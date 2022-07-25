module.exports = {
  preset: 'ts-jest',
  testEnvironment: '@midwayjs/jest-environment-service-worker',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
