import { attachClass, attachMethod, customCls, customMethod, preload, propertyKeyA, propertyKeyB } from './custom';
import { Provide, Scope, ScopeEnum, Logger, Controller } from '../../../src';

@Provide('123')
@Scope(ScopeEnum.Singleton)
@preload()
@customCls()
@attachClass('/')
@attachClass('/api')
@attachClass('/router')
@attachClass('/test')
export class ManagerTest {

  @propertyKeyA('property_a')
  @propertyKeyB('test_a')
  @propertyKeyB('test_b')
  @propertyKeyB('test_c')
  testProperty;

  @customMethod()
  testSomething() {
    console.log('hello world');
  }

  @attachMethod('/aaa')
  @attachMethod('/bbb')
  @attachMethod('/ccc')
  index() {
    console.log('hello world index');
  }

}

export class Base {
  @Logger('logbase')
  logger: any;
}

@Provide()
@Controller('/api/one')
export class ControllerOne extends Base {

}
@Provide()
@Controller('/api/two')
export class ControllerTwo extends Base {

}
