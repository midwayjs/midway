import { Validate, Rule, RuleType } from '../src';
import { createLightApp, close } from '@midwayjs/mock';
import * as Joi from 'joi';
import * as Valid from '../src';

import * as assert from 'assert';
import { Provide } from '@midwayjs/decorator';
describe('/test/check.test.ts', () => {
  it('check with check', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });

    class TO {

    }

    @Rule(TO)
    class UserDTO extends TO{
      @Rule(RuleType.number().max(10))
      age: number;
    }

    @Rule(UserDTO)
    class HelloDTO extends UserDTO{
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: HelloDTO) {
        return data;
      }
    }
    const user = {
      age: 8
    };

    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);

    await close(app);
  });

  it('check with check with extends', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class TO{

    }

    @Rule(TO)
    class UserDTO extends TO{
      @Rule(RuleType.number().max(10))
      age: number;
    }

    @Rule(UserDTO)
    class HelloDTO extends UserDTO{

      @Rule(RuleType.number().min(4))
      age: number;
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: HelloDTO) {
        return data;
      }
    }
    const user = {
      age: 11
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check with options', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO, {required: false})
      world?: WorldDTO;
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check with array', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });

    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO)
      world: WorldDTO[];
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: [{
        age: 10
      }, {
        age: 22
      }]
    };

    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    expect(()=> hello.school(1, user)).toThrow();
    await close(app);
  });

  it.skip('check with check and transform object', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(RuleType.string().required())
      firstName: string;

      @Rule(RuleType.string().max(10))
      lastName: string;

      getName?() {
        return this.firstName + ' ' + this.lastName;
      }

      isAdult?() {
        return this.age > 36 && this.age < 60;
      }
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 8,
      firstName: 'Johny',
      lastName: 'Cage',
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    expect(result.getName()).toEqual('Johny Cage');
    assert.deepEqual(result, user);
  });

  it('check with no check', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    @Provide()
    class Hello {
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 18,
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check when vo have two level', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO)
      world: WorldDTO;
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: {
        age: 18,
      },
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const result = hello.school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check when vo have two level not equal', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO)
      world: WorldDTO;
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: {
        age: 22,
      },
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    expect(() => {
      hello.school(1, user);
    }).toThrow(Error);
  });

  it('check with check when two level and array and not equal', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO)
      worlds: WorldDTO[];
    }

    @Provide()
    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 10,
      worlds: [
        {
          age: 22,
        },
      ],
    };
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    expect(() => {
      hello.school(1, user);
    }).toThrow(Error);
  });

  it.skip('should transform string to number', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });
    class UserNewDTO {
      @Rule(RuleType.number().required())
      id: number;
    }

    @Provide()
    class Hello {
      @Validate()
      school(user: UserNewDTO) {
        return user;
      }
    }
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);
    const data = hello.school({
      id: '555'
    } as any)
    expect(typeof data.id).toEqual('number');
  });

  it('should test joi transform type', function () {
    const schema = Joi.object({
      age: Joi.number()
    });
    const result = schema.validate({
      age: '12'
    });
    expect(typeof result.value.age).toEqual('number');
  });

  it('should test global validate config', async () => {
    const app = await createLightApp('', {
      configurationModule: [Valid]
    });

    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    @Provide()
    class Hello {
      @Validate({
        validateOptions: {
          allowUnknown: true,
        },
        errorStatus: 400
      })
      school(data: UserDTO) {
        return data;
      }
    }
    app.getApplicationContext().bind(Hello);
    const hello = await app.getApplicationContext().getAsync(Hello);

    let error;
    try {
      hello.school({
        age: 11
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status).toEqual(400);

    const result = hello.school({
      age: 1,
      name: 'hello',
    } as any);
    expect(result['name']).toEqual('hello');

    await close(app);
  });
});
