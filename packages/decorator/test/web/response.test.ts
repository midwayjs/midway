import {
  ContentType, createRender,
  getPropertyMetadata,
  HttpCode,
  Redirect,
  SetHeader, WEB_RESPONSE_CONTENT_TYPE, WEB_RESPONSE_HEADER,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_KEY,
  WEB_RESPONSE_REDIRECT, WEB_RESPONSE_RENDER
} from '../../src';

describe('/test/web/response.test.ts', function () {

  const Render = createRender({ render: () => '', renderString: () => ''});

  class Test {
    @Redirect('/login', 301)
    redirectToHome() {
    }

    @Redirect('/login')
    redirectDefault() {
    }

    @HttpCode(201)
    async home() {
      return 'good';
    }

    @SetHeader('x-bbb', 'ccc')
    async index() {
      return 'good';
    }

    @SetHeader({
      'x-ccc': 'ddd',
      'x-eee': 'eee',
    })
    async index2() {
      return 'good';
    }

    @ContentType('html')
    async getHTML() {
      return '<body></body>'
    }

    @Render('index.html')
    async renderTpl() {
      return {
        b: 1
      }
    }
  }

  it('should test redirect use default code', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'redirectDefault');
    expect(data[0].type).toEqual(WEB_RESPONSE_REDIRECT);
    expect(data[0].url).toEqual('/login');
    expect(data[0].code).toEqual(302);
  });

  it('should test redirect', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'redirectToHome');
    expect(data[0].type).toEqual(WEB_RESPONSE_REDIRECT);
    expect(data[0].url).toEqual('/login');
    expect(data[0].code).toEqual(301);
  });

  it('should test httpCode', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'home');
    expect(data[0].type).toEqual(WEB_RESPONSE_HTTP_CODE);
    expect(data[0].code).toEqual(201);
  });

  it('should test setHeader', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'index');
    expect(data[0].type).toEqual(WEB_RESPONSE_HEADER);
    expect(data[0].setHeaders).toEqual({ 'x-bbb': 'ccc' });
  });

  it('should test setHeader use object', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'index2');
    expect(data[0].type).toEqual(WEB_RESPONSE_HEADER);
    expect(data[0].setHeaders).toEqual({
      'x-ccc': 'ddd',
      'x-eee': 'eee',
    });
  });

  it('should test set content-type', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'getHTML');
    expect(data[0].type).toEqual(WEB_RESPONSE_CONTENT_TYPE);
    expect(data[0].contentType).toEqual('html');
  });

  it('should test create render', function () {
    const data = getPropertyMetadata(WEB_RESPONSE_KEY, Test, 'renderTpl');
    expect(data[0].type).toEqual(WEB_RESPONSE_RENDER);
    expect(data[0].templateName).toEqual('index.html');
  });
});
