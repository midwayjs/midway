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

    class Hello {
      @Validate(true)
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 8,
      firstName: 'Johny',
      lastName: 'Cage',
    };
    const result = new Hello().school(1, user);
    expect(result.getName()).toEqual('Johny Cage');
    assert.deepEqual(result, user);
  });

  it('check with no check', () => {
    class UserDTO {
      @Rule(RuleType.number().max(10))
      age: number;
    }

    class Hello {
      school(a, data: UserDTO) {
        return data;
      }
    }
    const user = {
      age: 18,
    };
    const result = new Hello().school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check when vo have two level', () => {
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
    const result = new Hello().school(1, user);
    assert.deepEqual(result, user);
  });

  it('check with check when vo have two level not equal', () => {
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
    expect(() => {
      new Hello().school(1, user);
    }).toThrow(Error);
  });

  it('check with check when two level and array and not equal', () => {
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
    expect(() => {
      new Hello().school(1, user);
    }).toThrow(Error);
  });
});
