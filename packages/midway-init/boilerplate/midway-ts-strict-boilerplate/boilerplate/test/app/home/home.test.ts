import { basename } from 'path'

import * as assert from 'power-assert'
import { app } from 'midway-mock/bootstrap'


const filename = basename(__filename)

describe(filename, () => {

  it('should assert', async () => {
    // eslint-disable-next-line
    const pkg = require('../../../package.json')
    assert(app.config.keys.startsWith(pkg.name))
    // const ctx = app.mockContext({});
    // await ctx.service.xx();
  })

  it('should GET /', async () => {
    const ret = await app.httpRequest()
      .get('/')
      .expect(200)

    assert(app.config.welcomeMsg && ret.res.text.startsWith(app.config.welcomeMsg))
  })
})
