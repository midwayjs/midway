import {
  attachPropertyDataToClass,
  getParamNames,
  WEB_ROUTER_PARAM_KEY,
} from '../../';

export interface GetFileStreamOptions {
  requireFile?: boolean; // required file submit, default is true
  defCharset?: string;
  limits?: {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  };

  checkFile?(
    fieldname: string,
    file: any,
    filename: string,
    encoding: string,
    mimetype: string
  ): void | Error;
}

export interface GetFilesStreamOptions extends GetFileStreamOptions {
  autoFields?: boolean;
}

export enum RouteParamTypes {
  QUERY,
  BODY,
  PARAM,
  HEADERS,
  SESSION,
  FILESTREAM,
  FILESSTREAM,
  NEXT,
  REQUEST_PATH,
  REQUEST_IP,
  QUERIES,
}

export interface RouterParamValue {
  index: number;
  type: RouteParamTypes;
  propertyData?: any;
}

const createParamMapping = function (type: RouteParamTypes) {
  return (propertyData?: any) => (target, propertyName, index) => {
    if (propertyData === undefined) {
      propertyData = getParamNames(target[propertyName])[index];
    }
    attachPropertyDataToClass(
      WEB_ROUTER_PARAM_KEY,
      {
        index,
        type,
        propertyData,
      },
      target,
      propertyName
    );
  };
};

export const Session = (property?: string) =>
  createParamMapping(RouteParamTypes.SESSION)(property);
export const Body = (property?: string) =>
  createParamMapping(RouteParamTypes.BODY)(property);
export const Query = (property?: string) =>
  createParamMapping(RouteParamTypes.QUERY)(property);
export const Param = (property?: string) =>
  createParamMapping(RouteParamTypes.PARAM)(property);
export const Headers = (property?: string) =>
  createParamMapping(RouteParamTypes.HEADERS)(property);
export const File = (property?: GetFileStreamOptions) =>
  createParamMapping(RouteParamTypes.FILESTREAM)(property);
export const Files = (property?: GetFilesStreamOptions) =>
  createParamMapping(RouteParamTypes.FILESSTREAM)(property);
export const RequestPath = () =>
  createParamMapping(RouteParamTypes.REQUEST_PATH)();
export const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
export const Queries = (property?: string) =>
  createParamMapping(RouteParamTypes.QUERIES)(property);
