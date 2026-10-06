import { Rule } from '@midwayjs/validation';
import * as Joi from 'joi';

export class CreateUserDTO {
  @Rule(Joi.string().min(1).max(20).required())
  name: string;

  @Rule(Joi.string().email().required())
  email: string;

  @Rule(Joi.number().integer().min(0).max(150).optional())
  age?: number;
}

export class UpdateUserDTO {
  @Rule(Joi.string().min(1).max(20).optional())
  name?: string;

  @Rule(Joi.string().email().optional())
  email?: string;

  @Rule(Joi.number().integer().min(0).max(150).optional())
  age?: number;
}

export class QueryUserDTO {
  @Rule(Joi.number().integer().min(1).optional())
  page?: number;

  @Rule(Joi.number().integer().min(1).max(100).optional())
  pageSize?: number;

  @Rule(Joi.string().optional())
  keyword?: string;
}
