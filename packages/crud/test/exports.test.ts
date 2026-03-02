import * as crudExports from '../src';
import * as functionalExports from '../src/functional';
import * as mikroExports from '../src/mikro';
import * as mongooseExports from '../src/mongoose';
import * as sequelizeExports from '../src/sequelize';
import * as typeormExports from '../src/typeorm';

describe('package exports', () => {
  it('should expose stable entrypoints for main, typeorm and functional exports', () => {
    const packageJson = require('../package.json');

    expect(typeof crudExports.Crud).toBe('function');
    expect(typeof typeormExports.TypeOrmCrudService).toBe('function');
    expect(typeof mikroExports.MikroCrudService).toBe('function');
    expect(typeof sequelizeExports.SequelizeCrudService).toBe('function');
    expect(typeof mongooseExports.MongooseCrudService).toBe('function');
    expect(typeof functionalExports.defineCrudRoutes).toBe('function');

    expect(packageJson.exports['.']).toBeDefined();
    expect(packageJson.exports['./typeorm']).toBeDefined();
    expect(packageJson.exports['./mikro']).toBeDefined();
    expect(packageJson.exports['./sequelize']).toBeDefined();
    expect(packageJson.exports['./mongoose']).toBeDefined();
    expect(packageJson.exports['./functional']).toBeDefined();
  });
});
