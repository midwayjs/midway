import { close, createHttpRequest, createLegacyApp } from '@midwayjs/mock';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { IMidwayApplication } from '@midwayjs/core';
import { PostService } from './fixtures/multi/src/subsystem/service/post';
import { Database } from 'sqlite3';
import { Values } from 'leoric';
import Post from './fixtures/multi/src/subsystem/model/post';

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

describe('test/multi.test.ts', () => {
  let app: IMidwayApplication;
  let postService: PostService;

  beforeAll(async () => {
    cleanFile(join(__dirname, 'fixtures/multi', 'database.sqlite'));
    cleanFile(join(__dirname, 'fixtures/multi', 'subsystem.sqlite'));
    app = await createLegacyApp(join(__dirname, 'fixtures', 'multi'));
    postService = await app
      .getApplicationContext()
      .getAsync(PostService);
  });

  afterAll(async () => {
    await close(app);
  });

  beforeEach(async () => {
    await postService.add({ title: 'Levi' });
  });

  afterEach(async () => {
    await postService.delete();
  });

  it('list post', async () => {
    const res = await createHttpRequest(app)
      .get('/api/posts')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toEqual('Levi');
  });

  it('bound to specifc database', async () => {
    const database = new Database(join(__dirname, 'fixtures/multi', 'subsystem.sqlite'));
    const result = await new Promise<Values<Post>>((resolve, reject) => {
      database.get('SELECT * FROM posts', (err, row) => {
        if (err) reject(err);
        else resolve(row as Values<Post>);
      });
    });
    expect(result).not.toBe(null);
    expect(result.title).toEqual('Levi');
  });

});
