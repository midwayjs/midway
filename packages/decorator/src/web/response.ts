import {
  attachPropertyMetadata,
  WEB_RESPONSE_REDIRECT,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_KEY,
} from '..';

export interface WebRedirectMetadata {
  url: string,
  code: number,
}

export interface WebHttpCodeMetadata {
  code: number,
}

export interface WebSetHeaderMetadata {
  setHeaders: object,
}

export function Redirect(url: string, code: number = 302) {
  return (target, key, descriptor: PropertyDescriptor) => {
    attachPropertyMetadata(
      WEB_RESPONSE_KEY, {
        type: WEB_RESPONSE_REDIRECT,
        data: {
          url,
          code,
        }
      },
      target,
      key
    );

    return descriptor;
  };
}

export function HttpCode(code: number) {
  return (target, key, descriptor: PropertyDescriptor) => {
    attachPropertyMetadata(
      WEB_RESPONSE_KEY, {
        type: WEB_RESPONSE_HTTP_CODE,
        data: {
          code
        },
      },
      target,
      key
    );

    return descriptor;
  };
}

export function SetHeader(headerKey: string | Object, value?: string) {
  return (target, key, descriptor: PropertyDescriptor) => {
    let headerObject: Object = {};
    if (value) {
      headerObject[headerKey as string] = value;
    } else {
      headerObject = headerKey as Object;
    }
    attachPropertyMetadata(
      WEB_RESPONSE_KEY, {
        type: WEB_RESPONSE_HEADER,
        data: {
          setHeaders: headerObject,
        }
      },
      target,
      key
    );

    return descriptor;
  };
}

export function ContentType(contentType: string) {
  return (target, key, descriptor: PropertyDescriptor) => {

    return descriptor;
  };
}

export function OnUndefined(data: Error | number) {
  return (target, key, descriptor: PropertyDescriptor) => {

    return descriptor;
  };
}

export function OnNull(data: Error | number) {
  return (target, key, descriptor: PropertyDescriptor) => {

    return descriptor;
  };
}

export function OnEmpty(data: Error | number) {
  return (target, key, descriptor: PropertyDescriptor) => {

    return descriptor;
  };
}

export function Render(templateName: string) {
  return (target, key, descriptor: PropertyDescriptor) => {

    return descriptor;
  };
}
