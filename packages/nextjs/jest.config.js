module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@midwayjs/web-bridge$': '<rootDir>/../web-bridge/src/index.ts',
    '^@midwayjs/core$': '<rootDir>/../core/src',
    '^@midwayjs/core/(.*)$': '<rootDir>/../core/src/$1',
    '^@midwayjs/core/functional$': '<rootDir>/../core/src/functional/index.ts',
    '^@midwayjs/nextjs$': '<rootDir>/src',
  },
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['./hack.js', './jest.setup.js'],
  coverageProvider: 'v8',
};
