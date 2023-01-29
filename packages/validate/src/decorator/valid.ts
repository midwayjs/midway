import { createCustomParamDecorator } from '@midwayjs/core';
import { AnySchema } from 'joi';
import { VALID_KEY } from '../constants';
import { DefaultValidPipe } from '../pipe';

export function Valid(schema?: AnySchema<any>) {
  return createCustomParamDecorator(
    VALID_KEY,
    {
      schema,
    },
    {
      pipes: [DefaultValidPipe],
    }
  );
}
