import { getClassMetadata, saveClassMetadata, saveModule } from '@midwayjs/core';
import { CRUD_KEY } from './constants';
import { CrudConfigError } from './error';
import { CrudOptions } from './interface';

function assertCrudOptions(options: CrudOptions) {
  if (!options || typeof options !== 'object') {
    throw new CrudConfigError('Crud options are required');
  }
  if (!options.model) {
    throw new CrudConfigError('Crud option "model" is required');
  }
  if (!options.service) {
    throw new CrudConfigError('Crud option "service" is required');
  }
}

/**
 * Marks a controller class as a CRUD resource.
 */
export function Crud<T = any>(options: CrudOptions): ClassDecorator {
  assertCrudOptions(options);
  return target => {
    saveModule(CRUD_KEY, target);
    saveClassMetadata(CRUD_KEY, options, target);
  };
}

/**
 * Reads CRUD options from a class.
 */
export function getCrudOptions(target: unknown): CrudOptions | undefined {
  return getClassMetadata<CrudOptions>(CRUD_KEY, target);
}

/**
 * Returns true when a class carries CRUD metadata.
 */
export function isCrudController(target: unknown): boolean {
  return !!getCrudOptions(target);
}
