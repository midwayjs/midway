import * as http from 'http';
import * as os from 'os';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';
import { httpError } from '@midwayjs/core';
import { MidwayAdapter } from '../src';

function sendRawRequest(
  server: http.Server,
  rawPath: string
): Promise<{ statusCode: number; body: string; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      return reject(new Error('Server is not listening on a TCP port'));
    }
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        method: 'GET',
        path: rawPath,
      },
      res => {
        let body = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            body,
            headers: res.headers,
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

describe('/test/security.test.ts', () => {
  describe('MidwayAdapter path traversal protection', () => {
    let tempRoot: string;
    let staticDir: string;
    let linkedStaticDir: string;
    let viewsDir: string;
    let symlinkSupported = true;
    let adapter: MidwayAdapter;

    beforeAll(() => {
      tempRoot = mkdtempSync(join(os.tmpdir(), 'midway-bull-board-sec-'));
      staticDir = join(tempRoot, 'static');
      const siblingDir = join(tempRoot, 'static-secret');
      viewsDir = join(tempRoot, 'views');

      mkdirSync(join(staticDir, 'images'), { recursive: true });
      mkdirSync(join(staticDir, 'locales', 'zh-CN'), { recursive: true });
      mkdirSync(siblingDir, { recursive: true });
      mkdirSync(viewsDir, { recursive: true });

      writeFileSync(join(tempRoot, 'secret.txt'), 'TOP_SECRET_PARENT');
      writeFileSync(join(siblingDir, 'secret.txt'), 'TOP_SECRET_SIBLING');
      writeFileSync(join(staticDir, 'app.js'), 'console.log("ok");');
      writeFileSync(join(staticDir, 'images', 'logo.svg'), '<svg></svg>');
      writeFileSync(
        join(staticDir, 'locales', 'zh-CN', 'messages.json'),
        '{"hello":"world"}'
      );
      writeFileSync(join(viewsDir, 'index.ejs'), '<html><%= basePath %></html>');

      linkedStaticDir = join(tempRoot, 'linked-static');
      try {
        symlinkSync(
          join(tempRoot, 'secret.txt'),
          join(staticDir, 'escape-link')
        );
        symlinkSync(staticDir, linkedStaticDir, 'junction');
      } catch (err: any) {
        if (err?.code === 'EPERM' || err?.code === 'EACCES') {
          symlinkSupported = false;
        } else {
          throw err;
        }
      }
    });

    afterAll(() => {
      rmSync(tempRoot, { recursive: true, force: true });
    });

    beforeEach(() => {
      adapter = new MidwayAdapter();
      adapter.setBasePath('/ui');
      adapter.setStaticPath('/static', staticDir);
      adapter.setViewsPath(viewsDir);
    });

    it('should serve valid static files and cache them', async () => {
      expect(await adapter.renderStatic('/static/app.js')).toBe(
        'console.log("ok");'
      );
      expect(await adapter.renderStatic('/static/images/logo.svg')).toBe(
        '<svg></svg>'
      );
      expect(
        await adapter.renderStatic('/static/locales/zh-CN/messages.json')
      ).toBe('{"hello":"world"}');
      // second read should hit cache
      expect(await adapter.renderStatic('/static/app.js')).toBe(
        'console.log("ok");'
      );
    });

    it('should work when staticsPath itself is a symlink (e.g. pnpm)', async () => {
      if (!symlinkSupported) {
        return;
      }
      adapter.setStaticPath('/static', linkedStaticDir);
      expect(await adapter.renderStatic('/static/images/logo.svg')).toBe(
        '<svg></svg>'
      );
      await expect(
        adapter.renderStatic('/static/escape-link')
      ).rejects.toThrow(httpError.ForbiddenError);
    });

    it('should reject direct, encoded, backslash, prefix, sibling and symlink traversals', async () => {
      const forbiddenPayloads = [
        '/static/../secret.txt',
        '/static/../../../../etc/passwd',
        '/static/images/../../secret.txt',
        '/static/%2e%2e/secret.txt',
        '/static/%2e%2e%2fsecret.txt',
        '/static/images/%2e%2e/%2e%2e/secret.txt',
        '/static/..\\secret.txt',
        '/static/..%5csecret.txt',
        '/static/C:/Windows/win.ini',
        '/static/C:secret.txt',
        '/static../secret.txt',
        '/static../../../etc/passwd',
        '/static//etc/passwd',
        '/static/%2fetc/passwd',
        '/static/../static-secret/secret.txt',
      ];
      if (symlinkSupported) {
        forbiddenPayloads.push('/static/escape-link');
      }

      for (const payload of forbiddenPayloads) {
        await expect(adapter.renderStatic(payload)).rejects.toThrow(
          httpError.ForbiddenError
        );
      }
    });

    it('should reject null bytes and malformed URI encodings with BadRequestError', async () => {
      const badPayloads = [
        '/static/app.js%00.png',
        '/static/app.js\0',
        '/static/%E0%A4%A',
      ];

      for (const payload of badPayloads) {
        await expect(adapter.renderStatic(payload)).rejects.toThrow(
          httpError.BadRequestError
        );
      }
    });

    it('should return NotFoundError for missing files, double-encoded paths, directories and empty static path', async () => {
      const notFoundPayloads = [
        '/static/missing.js',
        '/static/%252e%252e%252fsecret.txt',
        '/static/images',
        '/static/',
        '/static',
      ];

      for (const payload of notFoundPayloads) {
        await expect(adapter.renderStatic(payload)).rejects.toThrow(
          httpError.NotFoundError
        );
      }
    });

    it('should protect renderView against path traversal', async () => {
      const html = await adapter.renderView('/');
      expect(html).toContain('/ui/');

      await expect(adapter.renderView('../secret.txt')).rejects.toThrow(
        httpError.ForbiddenError
      );
      await expect(adapter.renderView('%2e%2e/secret.txt')).rejects.toThrow(
        httpError.ForbiddenError
      );
      await expect(adapter.renderView('..\\secret.txt')).rejects.toThrow(
        httpError.ForbiddenError
      );
      await expect(adapter.renderView('/etc/passwd')).rejects.toThrow(
        httpError.ForbiddenError
      );
    });
  });

  describe('HTTP integration tests with raw paths (Koa & Express)', () => {
    it('should block raw path traversal and enforce prefix boundaries in Koa', async () => {
      const app = await createLegacyApp(
        join(__dirname, 'fixtures', 'base-app-koa')
      );
      const server = http.createServer(app.callback());
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));

      try {
        const okRes = await sendRawRequest(server, '/ui/static/images/logo.svg');
        expect(okRes.statusCode).toBe(200);
        expect(okRes.headers['content-type']).toMatch(/image\/svg\+xml/);

        const rawTraversal = await sendRawRequest(
          server,
          '/ui/static/../../../../../../../../../../../../etc/passwd'
        );
        expect(rawTraversal.statusCode).toBe(403);
        expect(rawTraversal.body).not.toContain('root:');

        const encodedTraversal = await sendRawRequest(
          server,
          '/ui/static/%2e%2e/%2e%2e/package.json'
        );
        expect(encodedTraversal.statusCode).toBe(403);

        const backslashTraversal = await sendRawRequest(
          server,
          '/ui/static/..%5c..%5cpackage.json'
        );
        expect(backslashTraversal.statusCode).toBe(403);

        const badEncoding = await sendRawRequest(server, '/ui/static/%E0%A4%A');
        expect(badEncoding.statusCode).toBe(400);

        const missingFile = await sendRawRequest(
          server,
          '/ui/static/does-not-exist.js'
        );
        expect(missingFile.statusCode).toBe(404);

        const noSlashBypass = await sendRawRequest(
          server,
          '/ui/static../../../../../../../../etc/passwd'
        );
        expect(noSlashBypass.statusCode).toBe(404);
        expect(noSlashBypass.body).not.toContain('root:');

        const prefixBypass1 = await sendRawRequest(
          server,
          '/other/ui/static/images/logo.svg'
        );
        expect(prefixBypass1.statusCode).toBe(404);

        const prefixBypass2 = await sendRawRequest(
          server,
          '/ui-other/static/images/logo.svg'
        );
        expect(prefixBypass2.statusCode).toBe(404);
      } finally {
        await new Promise<void>(resolve => server.close(() => resolve()));
        await close(app);
      }
    });

    it('should block raw path traversal and enforce prefix boundaries in Express', async () => {
      const app = await createLegacyApp(
        join(__dirname, 'fixtures', 'base-app-express')
      );
      const server = http.createServer(app);
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));

      try {
        const okRes = await sendRawRequest(
          server,
          '/bull-board/static/images/logo.svg'
        );
        expect(okRes.statusCode).toBe(200);
        expect(okRes.headers['content-type']).toMatch(/image\/svg\+xml/);

        const rawTraversal = await sendRawRequest(
          server,
          '/bull-board/static/../../../../../../../../../../../../etc/passwd'
        );
        expect(rawTraversal.statusCode).toBe(403);
        expect(rawTraversal.body).not.toContain('root:');

        const encodedTraversal = await sendRawRequest(
          server,
          '/bull-board/static/%2e%2e/%2e%2e/package.json'
        );
        expect(encodedTraversal.statusCode).toBe(403);

        const backslashTraversal = await sendRawRequest(
          server,
          '/bull-board/static/..%5c..%5cpackage.json'
        );
        expect(backslashTraversal.statusCode).toBe(403);

        const badEncoding = await sendRawRequest(
          server,
          '/bull-board/static/%E0%A4%A'
        );
        expect(badEncoding.statusCode).toBe(400);

        const missingFile = await sendRawRequest(
          server,
          '/bull-board/static/does-not-exist.js'
        );
        expect(missingFile.statusCode).toBe(404);

        const noSlashBypass = await sendRawRequest(
          server,
          '/bull-board/static../../../../../../../../etc/passwd'
        );
        expect(noSlashBypass.statusCode).toBe(404);
        expect(noSlashBypass.body).not.toContain('root:');

        const prefixBypass1 = await sendRawRequest(
          server,
          '/other/bull-board/static/images/logo.svg'
        );
        expect(prefixBypass1.statusCode).toBe(404);

        const prefixBypass2 = await sendRawRequest(
          server,
          '/bull-board-other/static/images/logo.svg'
        );
        expect(prefixBypass2.statusCode).toBe(404);
      } finally {
        await new Promise<void>(resolve => server.close(() => resolve()));
        await close(app);
      }
    });
  });
});
