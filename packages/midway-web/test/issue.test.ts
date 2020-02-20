import { clearAllModule } from 'injection'


const request = require('supertest')
const pedding = require('pedding')

const utils = require('./utils')


describe('/test/issue.test.ts', () => {

  afterEach(clearAllModule)

  describe('test #264 issue to fix ctx bind', () => {
    let app
    before(() => {
      app = utils.app('issue/base-app-lazyload-ctx', {
        typescript: true,
      })
      return app.ready()
    })

    after(() => app.close())

    it('should get right ctx path', (done) => {

      done = pedding(4, done)

      request(app.callback())
        .get('/api/code/list')
        .expect(200)
        .expect('Code: /api/code/list, User: /api/code/list, Hello Result', done)

      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('User: /api/user/info, Hello Result', done)

      request(app.callback())
        .get('/api/code/list')
        .expect(200)
        .expect('Code: /api/code/list, User: /api/code/list, Hello Result', done)

      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('User: /api/user/info, Hello Result', done)

    })
  })

  describe('test #215 issue to fix egg extension', () => {
    let app
    before(() => {
      app = utils.app('issue/base-app-extend-context', {
        typescript: true,
      })
      return app.ready()
    })

    after(() => app.close())

    it('Correctly reference the egg extension implementation', (done) => {

      request(app.callback())
        .get('/api/user/info')
        .expect(200)
        .expect('hello world', done)

    })
  })

})
