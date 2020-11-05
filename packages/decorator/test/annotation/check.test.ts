import { Validate, Rule, RuleType } from '../../src';
import * as assert from 'assert';
describe('/test/annotation/check.test.ts', () => {
  it('check with check', () => {
    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    class Hello {
      @Validate()
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 8,
    };
    const result = new Hello().school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check and transform object', () => {
    class UserDTO1 {
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

    class Hello1 {
      @Validate(true)
      school(a, data: UserDTO1) {
        return data;
      }
    }
    const user = {
      age: 8,
      firstName: 'Johny',
      lastName: 'Cage',
    };
    const result = new Hello1().school(1, user);
    expect(result.getName()).toEqual('Johny Cage');
    assert.deepEqual(result, user);
  });

  it('check with no check', () => {
    class UserDTO2 {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    class Hello2 {
      school(a, data: UserDTO2) {
        return data;
      }
    }
    const user = {
      age: 18,
    };
    const result = new Hello2().school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check when vo have two level', () => {
    class WorldDTO {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO3 {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO)
      world: WorldDTO;
    }

    class Hello3 {
      @Validate()
      school(a, data: UserDTO3) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: {
        age: 18,
      },
    };
    const result = new Hello3().school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check when vo have two level not equal', () => {
    class WorldDTO1 {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO4 {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO1)
      world: WorldDTO1;
    }

    class Hello4 {
      @Validate()
      school(a, data: UserDTO4) {
        return data;
      }
    }
    const user = {
      age: 10,
      world: {
        age: 22,
      },
    };
    expect(() => {
      new Hello4().school(1, user);
    }).toThrow(Error);
  });

  it('check with check when two level and array and not equal', () => {
    class WorldDTO2 {
      @Rule(RuleType.number().max(20))
      age: number;
    }

    class UserDTO5 {
      @Rule(RuleType.number().max(10))
      age: number;

      @Rule(WorldDTO2)
      worlds: WorldDTO2[];
    }

    class Hello5 {
      @Validate()
      school(a, data: UserDTO5) {
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
    expect(() => {
      new Hello5().school(1, user);
    }).toThrow(Error);
  });

  it('should transform string to number', function () {
    class UserNewDTO6 {
      @Rule(RuleType.number().required())
      id: number;
    }

    class Hello6 {
      @Validate()
      school(user: UserNewDTO6) {
        return user;
      }
    }

    const data = new Hello6().school({
      id: '555'
    } as any)
    expect(typeof data.id).toEqual('number');
  });

  it('should check DTO with parent', function () {
    class BaseAuthDTO {
      @Rule(RuleType.string().required())
      username: string

      @Rule(RuleType.string().required())
      password?: string
    }

    class LoginDTO extends BaseAuthDTO {}

    class RegisterDTO extends BaseAuthDTO {
      @Rule(RuleType.string().required())
      confirm_passward: string
    }

    class Hello7 {
      @Validate()
      invoke(dto: LoginDTO) {}
      invokeAnother(dto: RegisterDTO) {}
    }

    new Hello7().invoke({ username: 'xxx' });
  });
});
