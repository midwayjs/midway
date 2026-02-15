module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@midwayjs/api-bridge$': '<rootDir>/../api-bridge/src/index.ts',
    '^@midwayjs/core$': '<rootDir>/../core/src',
    '^@midwayjs/core/(.*)$': '<rootDir>/../core/src/$1',
    '^@midwayjs/core/functional$': '<rootDir>/../core/src/functional/index.ts',
    '^@midwayjs/react$': '<rootDir>/src',
    '^react$': '<rootDir>/../nextjs/node_modules/react',
    '^react-dom/server$': '<rootDir>/../nextjs/node_modules/react-dom/server',
  },
  coveragePathIgnorePatterns: ['<rootDir>/test/', '<rootDir>/dist/'],
  coverageProvider: 'v8',
};
