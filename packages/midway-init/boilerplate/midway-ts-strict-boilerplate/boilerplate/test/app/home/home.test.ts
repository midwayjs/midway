import { basename } from 'path'

import { app, assert } from 'midway-mock/bootstrap'


const filename = basename(__filename)

describe(filename, () => {

  it('should assert', async () => {
    // eslint-disable-next-line
    const pkg = require('../../../package.json')
    assert(app.config.keys.startsWith(pkg.name))
    // const ctx = app.mockContext({});
    // await ctx.service.xx();
  })

  it('should GET /', async () => app.httpRequest()
    .get('/')
    .expect('Welcome to midwayjs!')
    .expect(200))
})
