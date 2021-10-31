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

    @ClassA()
    @ClassB()
    class Test {

      @PropertyB()
      abc;

      @MethodC()
      async invoke(@ParamD() @ParamE() type: number, @ParamD() user: string) {

      }
    }

    console.log(Test);
  })
})
