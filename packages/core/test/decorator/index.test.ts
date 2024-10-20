import 'reflect-metadata';

describe('test', () => {
  it('test decorator run', async () => {
    function ClassA(): ClassDecorator {
      return (target) => {
        console.log('A class decorator', target);
      }
    }

    function ClassB(): ClassDecorator {
      return (target) => {
        console.log('B class decorator', target);
      }
    }

    function PropertyB(): PropertyDecorator {
      return (target, propertyKey) => {
        console.log('B property decorator', target.constructor);
      }
    }

    function MethodC(): MethodDecorator {
      return (target, propertyKey, descriptor) => {
        console.log('C method decorator', target.constructor, propertyKey);

        const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        console.log('MethodC decorator param types', target, propertyKey, paramTypes);
      }
    }

    function MethodF(): MethodDecorator {
      return (target, propertyKey, descriptor) => {
        console.log('F method decorator', target.constructor, propertyKey);
      }
    }

    function ParamD(): ParameterDecorator {
      return (target, propertyKey, parameterIndex) => {
        console.log('D param decorator', target.constructor, propertyKey, parameterIndex);
      }
    }

    function ParamE(): ParameterDecorator {
      return (target, propertyKey, parameterIndex) => {
        console.log('E param decorator', target.constructor, propertyKey, parameterIndex);
      }
    }

    function ConstructorF(): ParameterDecorator {
      return (target, propertyKey, parameterIndex) => {
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
        console.log('F constructor decorator', target, propertyKey, parameterIndex, paramTypes[0]);
      }
    }

    @ClassA()
    @ClassB()
    class Test {

      constructor(@ConstructorF() a: string) {
        console.log('constructor', a);
      }

      @PropertyB()
      abc;

      @MethodC()
      @MethodF()
      async invoke(@ParamD() @ParamE() type: number, @ParamD() user: string) {

      }
    }

    console.log(Test);
  })

  it('should reflect.construct', () => {
    class Dependency {
      a = [];
      args;
      constructor(...args) {
        this.args = args;
      }
    }
    let inst = Object.create(Dependency.prototype);
    inst = Reflect.construct(Dependency, [1, 2, 3], Object.getPrototypeOf(inst).constructor);

    expect(inst.args).toEqual([1, 2, 3]);
    expect(inst.a).toEqual([]);
    expect(inst).toBeInstanceOf(Dependency);
  });
})
