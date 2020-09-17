module.exports = (options = {}) => {
  return Object.assign({
    preset: 'ts-jest',
    testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
    coveragePathIgnorePatterns: ['<rootDir>/test/'],
  }, options);
}
