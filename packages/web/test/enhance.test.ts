const assert = require('assert');
const request = require('supertest');
import path = require('path');
import urllib = require('urllib');
import { creatApp, closeApp } from './utils';

const mm = require('mm');
const pedding = require('pedding');

describe('/test/enhance.test.ts', () => {
  describe('load ts file', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should get config merge', () => {
      assert(
        app.config.rundir,
        path.join(__dirname, './fixtures/enhance/base-app/run')
      );
    });

    it('mock context', async () => {
      const ctx = app.mockContext();
      const userService = await ctx.requestContext.getAsync('userService');
      assert((await userService.hello()) === 'world,0');
    });

    it('should load ts directory', done => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('load ts class controller use decorator', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-controller');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load controller from requestContext', done => {
      request(app.callback())
        .get('/api/index')
        .expect(200)
        .expect('index', done);
    });

    it('should load controller use controller decorator', done => {
      request(app.callback())
        .get('/components/')
        .expect(200)
        .expect('hello', done);
    });

    it('should load controller use controller decorator prefix /', done => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('root_test', done);
    });
  });

  describe('load ts class when controller has default export', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-controller-default-export');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load controller', done => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('root_test', done);
    });
  });

  describe('load ts class controller use decorator conflicts', () => {
    it('should load controller conflicts', async () => {
      let app;
      let suc = false;
      try {
        app = await creatApp('enhance/base-app-controller-conflicts');
      } catch (e) {
        suc = true;
      }
      assert.ok(suc);
      await closeApp(app);
    });
  });

  describe('load ts class and use default scope', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-default-scope');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load controller from requestContext', done => {
      request(app.callback())
        .get('/api/index')
        .expect(200)
        .expect('index', done);
    });

    it('should load controller use controller decorator', done => {
      request(app.callback())
        .get('/api/test')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('load ts file and use config, plugin decorator', () => {
    let app;

    beforeAll(async () => {
      app = await creatApp('enhance/base-app-decorator');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load ts directory', done => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect(/3t/, done);
    });

    it('should hello controller be ok', done => {
      request(app.callback())
        .get('/hello/say')
        .expect(200)
        .expect('service,hello,a,b', done);
    });

    it('should config controller be ok', done => {
      done = pedding(2, done);

      request(app.callback())
        .get('/config/test')
        .expect(200)
        .expect({a: 1, b: true, c: 2}, done);

      request(app.callback())
        .get('/config/test2')
        .expect(200)
        .expect({bucLogin: false, plugin2: true}, done);
    });

    it('should param controller be ok ', async () => {
      // done = pedding(11, done);

      app.mockCsrf();

      await request(app.callback())
        .get('/param/12/test?name=1')
        .expect(200)
        .expect({id: '12', name: '1'});

      await request(app.callback())
        .get('/param/query?name=1')
        .expect(200)
        .expect({name: '1'});

      await request(app.callback())
        .get('/param/query_id?id=1')
        .expect(200)
        .expect('1');

      await request(app.callback())
        .get('/param/param/12/test/456')
        .expect(200)
        .expect({id: '12', userId: '456'});

      await request(app.callback())
        .get('/param/param/12')
        .expect(200)
        .expect('12');

      await request(app.callback())
        .post('/param/body')
        .type('form')
        .send({id: '1'})
        .expect(200)
        .expect({id: '1'});

      await request(app.callback())
        .get('/param/body_id')
        .type('form')
        .send({id: '1'})
        .expect(200)
        .expect('1');

      await request(app.callback())
        .get('/param/session')
        .expect('{}');

      await request(app.callback())
        .get('/param/headers')
        .expect(200)
        .expect('127');

      await request(app.callback())
        .get('/param/headers_host')
        .expect(200)
        .expect('127');

      const imagePath = path.join(
        __dirname,
        'fixtures/enhance',
        'base-app-decorator',
        '1.jpg'
      );
      const imagePath1 = path.join(
        __dirname,
        'fixtures/enhance',
        'base-app-decorator',
        '2.jpg'
      );

      await request(app.callback())
        .post('/param/file')
        .field('name', 'form')
        .attach('file', imagePath)
        .expect('ok');

      await request(app.callback())
        .get('/public/form.jpg')
        .expect('content-length', '16424')
        .expect(200);

      await request(app.callback())
        .post('/param/files')
        .field('name1', '1')
        .attach('file1', imagePath)
        .field('name2', '2')
        .attach('file2', imagePath1)
        .field('name3', '3')
        .expect('ok');

      await request(app.callback())
        .get('/public/1.jpg')
        .expect('content-length', '16424')
        .expect(200);

      await request(app.callback())
        .get('/public/2.jpg')
        .expect('content-length', '16424')
        .expect(200);
    });

    it('pipeline ctx should be ok', async () => {
      await request(app.callback())
        .get('/hello/stage')
        .expect(200);
    });

    it('circular shoule be ok', async () => {
      await request(app.callback())
        .get('/circular/test')
        .expect('success')
        .expect(200);
    });

    it('configuration package controller should be ok', async () => {
      await request(app.callback())
        .get('/book/1')
        .expect(
          '[{"id":1,"name":"小森林","ISBN":"9787541089329","desc":"《小森林》是知名漫画家五十岚大介的经典作品，也是豆瓣高分电影《小森林》原著，讲述一位平凡女孩在田园生活中寻找自我的故事。"}]'
        )
        .expect(200);
    });
  });

  describe('load ts file and use third party module', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-utils');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load ts directory and inject module', done => {
      request(app.callback())
        .get('/api/test')
        .expect(200)
        .expect('false3', done);
    });
  });

  describe('load ts file and use async init', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-async');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load ts directory and inject module', done => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('10t', done);
    });
  });

  describe('ts directory different from other', () => {
    let app;
    beforeAll(async () => {
      mm(process.env, 'HOME', '');
      app = await creatApp('enhance/base-app');
    });
    afterEach(mm.restore);
    afterAll(async () => {
      await closeApp(app);
    })

    it('should appDir not equal baseDir', () => {
      const appInfo = app.loader.getAppInfo();
      assert(appInfo['name'] === app.name);
      assert(appInfo['baseDir'] === app.baseDir);
      assert(appInfo['baseDir'] === app.appDir + '/src');
    });
  });

  describe('load ts file support constructor inject', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-constructor');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load ts directory and inject in constructor', done => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('63t', done);
    });
  });

  describe('auto load function file and inject by function name', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-function');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load ts directory and inject in constructor', done => {
      request(app.callback())
        .get('/api')
        .expect(200)
        .expect('64t', done);
    });
  });

  describe('should support multi router in one function', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-router');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should invoke different router and get same result', done => {
      done = pedding(3, done);
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello', done);

      request(app.callback())
        .get('/home')
        .expect(200)
        .expect('hello', done);

      request(app.callback())
        .get('/poster')
        .expect(200)
        .expect('hello', done);
    });
  });

  describe('should support change route priority', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-router-priority');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should invoke different router and get same result', done => {
      done = pedding(3, done);
      request(app.callback())
        .get('/hello')
        .expect(200)
        .expect('hello', done);

      request(app.callback())
        .get('/world')
        .expect(200)
        .expect('world', done);

      request(app.callback())
        .get('/api/hello')
        .expect(200)
        .expect('api', done);
    });
  });

  describe('plugin can load controller directory directly', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/loader-duplicate');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should fix egg-socket.io load controller directory', done => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('root_test', done);
    });
  });

  describe('load tsx file', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-controller-tsx');
    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load tsx controller', done => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect(/react/, done);
    });
  });

  describe('support middleware parameter', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-middleware');

    });

    afterAll(async () => {
      await closeApp(app);
    })

    it('should load middleware in controller and router', done => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('1111444455552224', done);
    });

    it('should support multi-router in one method', done => {
      request(app.callback())
        .post('/api/data')
        .expect(200)
        .expect('11114444', done);
    });
  });

  describe('shoule egg hackernew be ok', () => {
    let app;
    beforeAll(async () => {
      app = await creatApp('enhance/base-app-hackernews', {
        typescript: false,
      });
      const originRequest = urllib.HttpClient2.prototype.request;
      mm(urllib.HttpClient2.prototype, 'request', (url, args, callback) => {
        if (url) {
          if (url.includes('https://hacker-news.firebaseio.com/v0/item')) {
            return {
              data: JSON.parse(
                '{"by":"pg","descendants":15,"id":1,"kids":[15,234509,487171,454426,454424,454410,82729],"score":57,"time":1160418111,"title":"Y Combinator","type":"story","url":"http://ycombinator.com"}'
              ),
            };
          }
          if (url.includes('https://hacker-news.firebaseio.com/v0/user')) {
            return {
              data: JSON.parse(
                '{"created":1344225010,"id":"stevage","karma":164,"submitted":[23038727,23013820,23013797,22995592,22820177,22819227,22817427,22659470,22624885,22624467,22621483,22333639,22305974,22143659,22069408,21987055,21987045,21807698,21807677,21799835,21662201,20438536,20290644,20261053,20102070,20018617,19134123,19134104,19134065,19134056,18803141,18803098,17922891,17902520,17850980,17780847,17534650,17435464,17386143,17335732,17161325,15890590,15414238,14785201,14493573,14393971,14251559,14176015,14029087,13793286,13621128,13621127,13274921,13138573,12497739,4343630]}'
              ),
            };
          }
          if (
            url.includes('https://hacker-news.firebaseio.com/v0/topstories')
          ) {
            return {
              data: JSON.parse(
                '{"12":23064974,"8":23072690,"19":23076081,"23":23071190,"4":23074435,"15":23070821,"11":23075484,"9":23076341,"22":23071134,"26":23064859,"13":23076241,"24":23072696,"16":23075556,"5":23073126,"10":23072956,"21":23069372,"6":23069114,"1":23073000,"17":23075097,"25":23074312,"14":23075893,"20":23065902,"27":23072443,"2":23072333,"18":23073109,"30":23073455,"7":23070567,"29":23070151,"3":23076007,"28":23071867}'
              ),
            };
          }
        }
        return originRequest(url, args, callback);
      });

    });

    afterAll(() => {
      mm.restore();
      return app.close();
    });

    it('news should be ok', async () => {
      await request(app.callback())
        .get('/news')
        .expect(res =>
          res.text.includes('<a href="/news/user/pseudolus">pseudolus</a>')
        )
        .expect('Content-Type', /html/)
        .expect(200);
    });

    it('new item should be ok', async () => {
      await request(app.callback())
        .get('/news/item/1')
        .expect(res =>
          res.text.includes(
            '<a class="title" target="_blank" href="http://ycombinator.com">Y Combinator</a>'
          )
        )
        .expect('Content-Type', /html/)
        .expect(200);
    });

    it('user should be ok', async () => {
      // stevage
      await request(app.callback())
        .get('/news/user/stevage')
        .expect(res => res.text.includes('Profile: stevage | egg - HackerNews'))
        .expect('Content-Type', /html/)
        .expect(200);
    });
  });

  describe('plugin error should be ok', () => {
    it('error', async () => {
      const originJoin = path.join;
      mm(path, 'join', (...args) => {
        if (args[0] === path.resolve(__dirname, '../src/loader')) {
          return originJoin(__dirname, '/../node_modules');
        }
        return originJoin.apply(path, args);
      });

      let msg = '';
      try {
        await creatApp('enhance/base-app-plugin-error');
      } catch (e) {
        msg = e.message;
      }
      assert.ok(msg.includes('Can not find plugin plugin2 in'));
      mm.restore();
    });
  });
});
