describe('test', () => {
  it('test decorator run', async () => {
    function ClassA(): ClassDecorator {
      return (target) => {
        console.log('A', target);
      }
    }

    function PropertyB(): PropertyDecorator {
      return (target, propertyKey) => {
        console.log('B', target.constructor);
      }
    }

    function MethodC(): MethodDecorator {
      return (target, propertyKey, descriptor) => {
        console.log('C', target.constructor, propertyKey);
      }
    }

    function ParamD(): ParameterDecorator {
      return (target, propertyKey, parameterIndex) => {
        console.log('D', target.constructor, propertyKey, parameterIndex);
      }
    }

    @ClassA()
    class Test {

      @PropertyB()
      abc;

      @MethodC()
      async invoke(@ParamD() type: number) {

      }
    }

    console.log(Test);
    //
    // this.registerMethodHandler('xxx', (instance, name, handler) => {
    //   return 'xxx';
    // });
    //
    // this.registerParamHandler('xxx', (instance, name, index) => {
    //   return 'xxx';
    // });
  })
})
