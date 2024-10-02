import { DecoratorManager, WEB_ROUTER_PARAM_KEY } from '../';
import {
  IMidwayContext,
  ParamDecoratorOptions,
  PipeUnionTransform,
} from '../../interface';

export enum RouteParamTypes {
  QUERY = 'query',
  BODY = 'body',
  PARAM = 'param',
  HEADERS = 'headers',
  SESSION = 'session',
  FILESTREAM = 'file_stream',
  FILESSTREAM = 'files_stream',
  NEXT = 'next',
  REQUEST_PATH = 'request_path',
  REQUEST_IP = 'request_ip',
  QUERIES = 'queries',
  FIELDS = 'fields',
  CUSTOM = 'custom',
}

export interface RouterParamValue {
  index: number;
  type: RouteParamTypes;
  propertyData?: any;
}

const createParamMapping = function (type: RouteParamTypes) {
  return (propertyOrPipes: any, options: ParamDecoratorOptions = {}) => {
    let propertyData = propertyOrPipes;
    if (Array.isArray(propertyOrPipes) && options.pipes === undefined) {
      options.pipes = propertyOrPipes;
      propertyData = undefined;
    }
    return DecoratorManager.createCustomParamDecorator(
      WEB_ROUTER_PARAM_KEY,
      {
        type,
        propertyData,
      },
      options
    );
  };
};

export declare type KoaLikeCustomParamDecorator<T = unknown> = (
  ctx: IMidwayContext
) => T | Promise<T>;

export declare type ExpressLikeCustomParamDecorator<T = unknown> = (
  req,
  res
) => T | Promise<T>;

export declare type CustomParamDecorator<T = unknown> =
  | KoaLikeCustomParamDecorator<T>
  | ExpressLikeCustomParamDecorator<T>;

export const createRequestParamDecorator = function (
  transform: CustomParamDecorator,
  pipesOrOptions?: ParamDecoratorOptions | Array<PipeUnionTransform>
) {
  pipesOrOptions = pipesOrOptions || {};
  if (Array.isArray(pipesOrOptions)) {
    pipesOrOptions = {
      pipes: pipesOrOptions as Array<PipeUnionTransform>,
    };
  }
  return createParamMapping(RouteParamTypes.CUSTOM)(transform, pipesOrOptions);
};

export const Session = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.SESSION)(propertyOrPipes, { pipes });
export const Body = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.BODY)(propertyOrPipes, { pipes });
export const Query = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.QUERY)(propertyOrPipes, { pipes });
export const Param = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.PARAM)(propertyOrPipes, { pipes });
export const Headers = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.HEADERS)(propertyOrPipes, { pipes });
export const File = (propertyOrPipes?: any, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.FILESTREAM)(propertyOrPipes, { pipes });
export const Files = (propertyOrPipes?: any, pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.FILESSTREAM)(propertyOrPipes, { pipes });
export const RequestPath = (pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.REQUEST_PATH)(undefined, { pipes });
export const RequestIP = (pipes?: PipeUnionTransform[]) =>
  createParamMapping(RouteParamTypes.REQUEST_IP)(undefined, { pipes });
export const Queries = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.QUERIES)(propertyOrPipes, { pipes });
export const Fields = (
  propertyOrPipes?: string | PipeUnionTransform[],
  pipes?: PipeUnionTransform[]
) => createParamMapping(RouteParamTypes.FIELDS)(propertyOrPipes, { pipes });
