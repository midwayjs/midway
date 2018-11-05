import { Container, RequestContainer } from '../../src/index';
import {expect} from 'chai';
const path = require('path');
import {
  BaseService,
  BaseServiceAsync,
  BaseServiceGenerator,
  Katana,
  Ninja,
  Samurai,
  Warrior
} from '../fixtures/class_sample';

import { BMWX1, Car, Electricity, Gas, Tesla, Turbo } from '../fixtures/class_sample_car';
import {childAsyncFunction, childFunction, testInjectAsyncFunction, testInjectFunction} from '../fixtures/fun_sample';
import {DieselCar, DieselEngine, engineFactory, PetrolEngine} from '../fixtures/mix_sample';
import { UserService } from '../fixtures/complex_injection/userService';
import { UserController } from '../fixtures/complex_injection/userController';
import { DbAPI } from '../fixtures/complex_injection/dbAPI';

describe('/test/unit/container.test.ts', () => {

  it('Should be able to store bindings', () => {
    const ninjaId = 'Ninja';
    const container = new Container();
    container.bind<Ninja>(ninjaId, <any>Ninja);
    const ninja = container.get(ninjaId);
    expect(ninja instanceof Ninja).to.be.true;
  });

  it('Should have an unique identifier', () => {
    const container1 = new Container();
    const container2 = new Container();
    expect(container1.id.length).eql(36);
    expect(container2.id.length).eql(36);
    expect(container1.id).not.eql(container2.id);
  });

  it('should inject property', () => {
    const container = new Container();
    container.bind<Warrior>('warrior', <any>Samurai);
    container.bind<Warrior>('katana1', <any>Katana);
    container.bind<Warrior>('katana2', <any>Katana);
    const warrior = container.get<Warrior>('warrior');
    expect(warrior instanceof Samurai).to.be.true;
    expect(warrior.katana1).not.to.be.undefined;
    expect(warrior.katana2).not.to.be.undefined;
  });

  it('should load js dir and inject with $', () => {
    const container = new Container();
    container.bind('app', require(path.join(__dirname, '../fixtures/js-app-inject', 'app.js')));
    container.bind('loader', require(path.join(__dirname, '../fixtures/js-app-inject', 'loader.js')).Loader);
    const app: any = container.get('app');
    expect(app.getConfig().a).to.equal(1);
  });

  it('should bind class directly', () => {
    const container = new Container();
    container.bind(Katana);
    const ins1 = container.get(Katana);
    const ins2 = container.get('katana');
    expect(ins1).to.equal(ins2);
  });

  it('should resolve instance', () => {
    const container = new Container();
    const ins1 = container.resolve(Katana);
    expect(ins1 instanceof Katana).to.be.true;
    expect(() => {
      container.get(Katana);
    }).to.throw(/is not valid in current context/);
  });

  it('should use get async method replace get', async () => {
    const container = new Container();
    container.bind(BaseService);
    const ins = await container.getAsync(BaseService);
    expect(ins instanceof BaseService).to.be.true;
  });

  it('should execute async init method when object created', async () => {
    const container = new Container();
    container.bind(BaseServiceAsync);
    const ins = <BaseServiceAsync>await container.getAsync(BaseServiceAsync);
    expect(ins.foodNumber).to.equal(20);
  });

  it('should execute generator init method when object created', async () => {
    const container = new Container();
    container.bind(BaseServiceGenerator);
    const ins = <BaseServiceGenerator>await container.getAsync(BaseServiceGenerator);
    expect(ins.foodNumber).to.equal(20);
  });

  it('should support constructor inject', async () => {
    const container = new Container();
    container.bind('engine', Turbo);
    container.bind('fuel', Gas);
    container.bind(Car);

    const car = <Car>await container.getAsync(Car);
    car.run();
    expect(car.getFuelCapacity()).to.equal(35);
  });

  it('should support constructor inject from parent', async () => {
    const container = new Container();
    container.bind('engine', Turbo);
    container.bind('fuel', Gas);
    container.bind(BMWX1);

    const car = <Car>await container.getAsync(BMWX1);
    car.run();
    expect(car.getFuelCapacity()).to.equal(35);
    expect(car.getBrand()).to.equal('bmw');
  });

  it('should inject constructor parameter in order', async () => {
    const container = new Container();
    container.bind(Tesla);
    container.bind('engine', Turbo);
    container.bind('fuel', Electricity);

    const car = <Car>await container.getAsync(Tesla);
    car.run();
    expect(car.getFuelCapacity()).to.equal(130);
  });

  describe('inject function', () => {

    it('should get function module', () => {
      const container = new Container();
      container.bind('parent', testInjectFunction);
      container.bind('child', childFunction);
      const result = container.get('parent');
      expect(result).to.equal(3);
    });

    it('should get async function module', async () => {
      const container = new Container();
      container.bind('parentAsync', testInjectAsyncFunction);
      container.bind('childAsync', childAsyncFunction);
      const result = await container.get('parentAsync');
      expect(result).to.equal(7);
    });
  });

  describe('mix suit', () => {

    const container = new Container();

    it('should use factory dynamic create object', () => {
      container.bind('engineFactory', engineFactory);
      container.bind(DieselCar);
      container.bind(PetrolEngine);
      container.bind(DieselEngine);
      const result = <DieselCar>container.get(DieselCar);
      result.run();
      expect(result.dieselEngine.capacity).to.equal(15);
      expect(result.backUpDieselEngine.capacity).to.equal(20);
    });

  });

  describe('dependency tree', () => {

    it('should generate dependency dot in requestContainer', async () => {
      const applicationContext = new Container();
      applicationContext.bind(UserService);
      applicationContext.bind(UserController);
      applicationContext.bind(DbAPI);
      const requestContext = new RequestContainer({}, applicationContext);
      await requestContext.getAsync(UserController);
      const tree = await requestContext.dumpDependency();
      expect(/userController/.test(tree)).to.be.true;
      expect(/newKey\(DbAPI\)/.test(tree)).to.be.false;
      const newTree = await applicationContext.dumpDependency();
      expect(/userController/.test(newTree)).to.be.true;
      expect(/newKey\(DbAPI\)/.test(newTree)).to.be.true;
    });

  });
});
