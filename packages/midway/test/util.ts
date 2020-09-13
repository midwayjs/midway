const { mm } = require('../../mock/dist');

export function cluster(name, options?) {
  options = Object.assign(
    {},
    {
      baseDir: require('path').join(__dirname, './fixtures/', name),
      framework: require('path').join(__dirname, './fixtures/midway'),
      cache: false,
    },
    options,
  );
  return mm.cluster(options);
}

export function getFilepath(name) {
  return require('path').join(__dirname, 'fixtures', name);
}
