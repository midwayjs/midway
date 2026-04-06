module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/dist/'],
  coverageProvider: 'v8',
};
