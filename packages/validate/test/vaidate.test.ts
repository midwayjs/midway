import { ValidationErrorItem } from 'joi';
import { Rule, RuleType, ValidateService } from '../src';

describe('validate.test.ts', function () {
  it('should test joi with message', function () {
    class UserDTO {
      @Rule(
        RuleType.number()
          .max(10)
          .message('{{#label}} data max over 10')
          .error(errors => {
            errors.forEach(err => {
              switch (err.code) {
                case 'any.empty':
                  err.message = 'Value should not be empty!';
                  break;
                case 'number.min':
                  err.message = `Value should have at least ${err} characters!`;
                  break;
                case 'number.max':
                  err.message = `Value should have at most ${err.code} characters!`;
                  break;
                default:
                  break;
              }
            });
            return errors as unknown as ValidationErrorItem;
          })
      )
      age: number;
    }

    const validateService = new ValidateService();

    try {
      validateService.validate(UserDTO, {
        age: 11,
      });
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
