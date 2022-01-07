import { ValidationErrorItem } from 'joi';
import { Rule, RuleType, ValidateService } from '../src';
import * as joi from 'joi';

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

  it('should test validate with schema', function () {
    const validateService = new ValidateService();
    validateService['i18nService'] = {
      getAvailableLocale() {
        return 'en-US';
      }
    } as any;

    validateService['i18nConfig'] = {
      defaultLocale: 'en-US'
    }

    validateService['validateConfig'] = {};

    const result = validateService.validateWithSchema(joi.object().keys({
      age: joi.number(),
    }), {
      age: 11,
    });
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({
      age: 11
    })
  });

  it('should test get schema', function () {
    const validateService = new ValidateService();
    validateService['i18nService'] = {
      getAvailableLocale() {
        return 'en-US';
      }
    } as any;

    validateService['i18nConfig'] = {
      defaultLocale: 'en-US'
    }

    validateService['validateConfig'] = {};

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

    const schema = validateService.getSchema(UserDTO);

    try {
      schema.validate({
        age: 11,
      });
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});
