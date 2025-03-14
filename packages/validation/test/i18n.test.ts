import { createLightApp, close } from '@midwayjs/mock';
import { ValidationService } from '../src/service';
import { mockValidatorOne, mockValidatorTwo } from './mock';
import * as validation from '../src';

describe('test/i18n.test.ts', () => {
  it('should test i18n with mock validator one', async () => {
    const app = await createLightApp({
      imports: [validation],
      globalConfig: {
        validation: {
          validators: {
            mock: mockValidatorOne
          },
          defaultValidator: 'mock'
        }
      }
    });

    const validationService = await app.getApplicationContext().getAsync(ValidationService);
    const schema = { type: 'string' };
    const value = 123;

    try {
      await validationService.validateWithSchema(schema, value);
    } catch (err) {
      expect(err.message).toContain('Expected string');
    }

    await close(app);
  });

  it('should test i18n with mock validator two', async () => {
    const app = await createLightApp({
      imports: [validation],
      globalConfig: {
        validation: {
          validators: {
            mock: mockValidatorTwo
          },
          defaultValidator: 'mock'
        }
      }
    });

    const validationService = await app.getApplicationContext().getAsync(ValidationService);
    const schema = {
      kind: 'object',
      shape: {
        name: { type: 'string' }
      }
    };
    const value = {};

    try {
      await validationService.validateWithSchema(schema, value);
    } catch (err) {
      expect(err.message).toContain('Missing required field: name');
    }

    await close(app);
  });
});
