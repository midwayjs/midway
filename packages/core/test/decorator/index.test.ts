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
})
