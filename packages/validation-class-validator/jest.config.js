module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist'],
  coveragePathIgnorePatterns: ['dist'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}; 