import * as request from 'supertest';
import * as express from 'express';
import * as getRawBody from 'raw-body';
import { formatMultipart, Application } from '../src';
import { resolve } from 'path';
import { assert } from 'console';
describe.only('test multipart', () => {
  it('should get multipart file', done => {
    const app = express();
    app.post('/upload', async (req, res) => {
      req.body = await getRawBody(req);
      req = await formatMultipart(req);
      const ctx = new Application().createContext(req, {});
      res.status(200).json({
        files: ctx.files,
        body: ctx.request.body,
      });
    });
    request(app)
      .post('/upload')
      .field('test', '123')
      .attach('upfile', resolve(__dirname, './resource/file.txt'))
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        assert(res.body.body.test === '123');
        assert(res.body.files.length === 1);
        assert(res.body.files[0].fieldname === 'upfile');
        assert(res.body.files[0].filename === 'file.txt');
        assert(res.body.files[0].mimeType === 'text/plain');
        done();
      });
  });
});
