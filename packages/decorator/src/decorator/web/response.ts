import {
  attachPropertyMetadata,
  WEB_RESPONSE_REDIRECT,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_HEADER,
  WEB_RESPONSE_KEY,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_RENDER,
} from '../../';

export function Redirect(url: string, code = 302) {
  return (target, key, descriptor: PropertyDescriptor) => {
    attachPropertyMetadata(
      WEB_RESPONSE_KEY,
      {
        type: WEB_RESPONSE_REDIRECT,
        url,
        code,
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
      WEB_RESPONSE_KEY,
      {
        type: WEB_RESPONSE_HTTP_CODE,
        code,
      },
      target,
      key
    );

    return descriptor;
  };
}

export function SetHeader(
  headerKey: string | Record<string, any>,
  value?: string
) {
  return (target, key, descriptor: PropertyDescriptor) => {
    let headerObject: Record<string, any> = {};
    if (value) {
      headerObject[headerKey as string] = value;
    } else {
      headerObject = headerKey as Record<string, any>;
    }
    attachPropertyMetadata(
      WEB_RESPONSE_KEY,
      {
        type: WEB_RESPONSE_HEADER,
        setHeaders: headerObject,
      },
      target,
      key
    );

    return descriptor;
  };
}

export function ContentType(contentType: string) {
  return (target, key, descriptor: PropertyDescriptor) => {
    attachPropertyMetadata(
      WEB_RESPONSE_KEY,
      {
        type: WEB_RESPONSE_CONTENT_TYPE,
        contentType,
      },
      target,
      key
    );

    return descriptor;
  };
}

export function createRender(RenderEngine: {
  render: () => string;
  renderString: () => string;
}) {
  return (templateName: string) => {
    return (target, key, descriptor: PropertyDescriptor) => {
      attachPropertyMetadata(
        WEB_RESPONSE_KEY,
        {
          type: WEB_RESPONSE_RENDER,
          templateName,
        },
        target,
        key
      );

      return descriptor;
    };
  };
}
