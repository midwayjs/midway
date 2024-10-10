import { DecoratorManager, PipeUnionTransform } from '@midwayjs/core';
import { AnySchema } from 'joi';
import { VALID_KEY } from '../constants';
import { DecoratorValidPipe } from '../pipe';

export function Valid(
  schemaOrPipes?: AnySchema<any> | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) {
  if (Array.isArray(schemaOrPipes)) {
    pipes = schemaOrPipes;
    schemaOrPipes = undefined;
  } else {
    pipes = pipes || [];
  }
  return DecoratorManager.createCustomParamDecorator(
    VALID_KEY,
    {
      schema: schemaOrPipes,
    },
    {
      pipes: [DecoratorValidPipe, ...pipes],
    }
  );
}
