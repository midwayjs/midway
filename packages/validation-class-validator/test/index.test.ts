import { createLightApp, close } from '@midwayjs/mock';
import { ValidationService } from '@midwayjs/validation';
import * as validation from '@midwayjs/validation';
import { IsString, IsNumber, Min, Max } from 'class-validator';
import classValidator from '../src/index';

describe('test/index.test.ts', () => {
  describe('validation service test with class validator', () => {
    let app;

    beforeEach(async () => {
      app = await createLightApp({
        imports: [validation],
        globalConfig: {
          validation: {
            validators: {
              classValidator,
            },
            defaultValidator: 'classValidator'
          }
        }
      });
    });

    afterEach(async () => {
      await close(app);
    });

    it('should validate class successfully', async () => {
      class UserDTO {
        @IsString()
        name: string;

        @IsNumber()
        @Min(0)
        @Max(100)
        age: number;
      }

      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const result = await validationService.validate(UserDTO, {
        name: 'harry',
        age: 18
      });

      expect(result.status).toBeTruthy();
      expect(result.value.name).toEqual('harry');
      expect(result.value.age).toEqual(18);
    });

    it('should throw error for invalid data', async () => {
      class UserDTO {
        @IsString()
        name: string;

        @IsNumber()
        @Min(0)
        @Max(100)
        age: number;
      }

      const validationService = await app.getApplicationContext().getAsync(ValidationService);
      const result = await validationService.validate(UserDTO, {
        name: 123,  // should be string
        age: 'abc'  // should be number
      }, {
        throwValidateError: false
      });

      expect(result.status).toBeFalsy();
      expect(result.message).toContain('name must be a string');
    });
  });
}); 