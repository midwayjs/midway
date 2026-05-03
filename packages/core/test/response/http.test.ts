// import whyIsNodeRunning from 'why-is-node-running'
import * as EventSource from 'eventsource';
import { HttpServerResponse, ServerSendEventMessage, sleep } from '../../src';
import { createServer, request, ServerResponse } from 'http';
import { join } from 'path';
import { createWriteStream, readFileSync, unlinkSync } from 'fs';
import { once } from 'events';
import { existsSync } from 'fs';

const OpenAI = require('openai').default;
const Anthropic = require('@anthropic-ai/sdk').default;

describe('response/http.test.ts', () => {
  async function requestText(port: number): Promise<string> {
    let result = '';
    await new Promise<void>(resolve => {
      const req = request(
        {
          hostname: 'localhost',
          port,
        },
        res => {
          res.on('data', chunk => {
            result += chunk.toString();
          });

          res.on('end', () => {
            resolve();
          });
        }
      );
      req.end();
    });
    return result;
  }

  async function listen(server: any): Promise<number> {
    server.listen(0);
    await once(server, 'listening');
    return server.address().port;
  }

  describe('test sse in base http', () => {
    it('should test push server send event', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream =  new HttpServerResponse({
          req,
          res,
          logger: console
        } as any).sse();
        Promise.resolve().then(async () => {
          stream.send({
            data: 'abc',
            retry: 0,
          });
          await sleep();
          stream.send({
            data: 'bcd'
          });
          await sleep();
          stream.send({
            data: 'bcd'.repeat(1000)
          });
          stream.send({
            data: {
              a: 1
            },
          });
          stream.sendEnd({
            data: '你好',
          });
        });
        stream.pipe(res);
      });
      port = await listen(server);

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
          result.push(data);
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        eventSource.addEventListener('close', function(e) {
          expect(e.data).toEqual('你好');
          // 只能客户端主动关闭
          eventSource.close();
          resolve();
        });
      })

      expect(result).toEqual(['abc', 'bcd', 'bcd'.repeat(1000), '{"a":1}']);
      server.close();

      // logs out active handles that are keeping node running
      // setImmediate(() => whyIsNodeRunning())
    });

    it('should send base format', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();
        Promise.resolve().then(async () => {
          stream.send({
            data: 'bcd',
            retry: 1000,
            event: 'test',
            id: '123'
          });
          stream.sendEnd({
            data: '你好',
          });
        });
        stream.pipe(res);
      });
      port = await listen(server);

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.on('test', ({ data }) => {
          result.push(data);
        });

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        eventSource.addEventListener('close', function(e) {
          expect(e.data).toEqual('你好');
          // 只能客户端主动关闭
          eventSource.close();
          resolve();
        });
      })

      expect(result).toEqual(['bcd']);

      server.close();
    });

    it('should close when client emit stream close', async () => {
      let port: number;
      let handler = null;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();
        handler = setInterval(() => {
          stream.send({
            data: 'abc',
          });
        }, 300);
        stream.pipe(res);
      });
      port = await listen(server);


      let count = 0;
      await new Promise<void>((resolve, reject) => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
          count++;
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        sleep(1000).then(() => {
          if (count >= 3) {
            eventSource.close();
            resolve();
          } else {
            reject();
          }
        });
      });

      clearInterval(handler);
      server.close();
    });

    it('should server response throw error', async () => {
      let handler = null;
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();
        handler = setInterval(() => {
          stream.send({
            data: 'abc',
          });

          stream.sendError(new Error('test error'));
          stream.destroy();
        }, 300);
        stream.pipe(res);
      });
      port = await listen(server);

      await new Promise<void>((resolve, reject) => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
          eventSource.close();
          resolve();
        }
      });

      clearInterval(handler);
      server.close();
    });

    it('should test with tpl', async () => {
      let port: number;
      const originTpl = HttpServerResponse.SSE_TPL;
      const server = createServer((req, res) => {

        HttpServerResponse.SSE_TPL = (chunk: ServerSendEventMessage) => {
          chunk.data = 'hhhh';
          return chunk;
        };

        const stream =  new HttpServerResponse({
          req,
          res,
          logger: console
        } as any).sse();
        Promise.resolve().then(async () => {
          stream.send({
            data: 'abc',
            retry: 0,
          });
          await sleep();
          stream.send({
            data: 'bcd'
          });
          await sleep();
          stream.send({
            data: 'bcd'.repeat(1000)
          });
          stream.send({
            data: {
              a: 1
            },
          });
          stream.sendEnd({
            data: '你好',
          });
        });
        stream.pipe(res);
      });
      port = await listen(server);

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
          result.push(data);
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        eventSource.addEventListener('close', function(e) {
          expect(e.data).toEqual('hhhh');
          // 只能客户端主动关闭
          eventSource.close();
          resolve();
        });
      })

      expect(result).toEqual(['hhhh', 'hhhh', 'hhhh', 'hhhh']);
      HttpServerResponse.SSE_TPL = originTpl;
      server.close();
    });

    it('should forward async iterable as eventsource sse', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield { type: 'message', data: 'a' };
            yield { type: 'message', data: 'b' };
          })()
        );
        stream.pipe(res);
      });
      port = await listen(server);

      const result = await requestText(port);
      server.close();

      expect(result).toContain(': ok\n');
      expect(result).toContain('data: {"type":"message","data":"a"}\n\n');
      expect(result).toContain('data: {"type":"message","data":"b"}\n\n');
      expect(result).toContain('event: close\ndata: \n\n');
    });

    it('should forward anthropic async iterable with event names', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield {
              type: 'content_block_delta',
              index: 0,
              delta: {
                type: 'thinking_delta',
                thinking: 'hello',
              },
            };
            yield {
              type: 'message_stop',
            };
          })(),
          {
            protocol: 'anthropic',
          }
        );
        stream.pipe(res);
      });
      port = await listen(server);

      const result = await requestText(port);
      server.close();

      expect(result).toContain('event: content_block_delta\n');
      expect(result).toContain(
        'data: {"type":"content_block_delta","index":0,"delta":{"type":"thinking_delta","thinking":"hello"}}\n\n'
      );
      expect(result).toContain('event: message_stop\n');
      expect(result).not.toContain('event: close\n');
    });

    it('should forward openai async iterable with done marker', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield {
              id: 'chatcmpl-1',
              object: 'chat.completion.chunk',
              choices: [
                {
                  delta: {
                    content: 'hello',
                  },
                },
              ],
            };
          })(),
          {
            protocol: 'openai',
          }
        );
        stream.pipe(res);
      });
      port = await listen(server);

      const result = await requestText(port);
      server.close();

      expect(result).toContain(
        'data: {"id":"chatcmpl-1","object":"chat.completion.chunk","choices":[{"delta":{"content":"hello"}}]}\n\n'
      );
      expect(result).toContain('data: [DONE]\n\n');
      expect(result).not.toContain('event: close\n');
    });

    it('should skip null transformed chunks when forwarding', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield { type: 'message', data: 'keep' };
            yield { type: 'message', data: 'drop' };
          })(),
          {
            closeEvent: false,
            transform: chunk => {
              if (chunk.data === 'drop') {
                return null;
              }
              return chunk;
            },
          }
        );
        stream.pipe(res);
      });
      port = await listen(server);

      const result = await requestText(port);
      server.close();

      expect(result).toContain('data: {"type":"message","data":"keep"}\n\n');
      expect(result).not.toContain('drop');
      expect(result).not.toContain('event: close\n');
    });

    it('should abort upstream when client closes', async () => {
      let port: number;
      let abortController: AbortController;
      const server = createServer((req, res) => {
        abortController = new AbortController();
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield { type: 'message', data: 'first' };
            await new Promise(resolve => {
              abortController.signal.addEventListener('abort', resolve, {
                once: true,
              });
            });
          })(),
          {
            abortController,
          }
        );
        stream.pipe(res);
      });
      port = await listen(server);

      await new Promise<void>(resolve => {
        const req = request(
          {
            hostname: 'localhost',
            port,
          },
          res => {
            res.once('data', () => {
              req.destroy();
            });
          }
        );
        req.on('close', () => {
          resolve();
        });
        req.end();
      });

      await sleep();
      server.close();

      expect(abortController.signal.aborted).toBeTruthy();
    });

    it('should forward openai protocol stream that openai sdk can consume', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield {
              id: 'chatcmpl-1',
              object: 'chat.completion.chunk',
              created: 0,
              model: 'test-model',
              choices: [
                {
                  index: 0,
                  delta: {
                    role: 'assistant',
                    content: 'hello',
                  },
                  finish_reason: null,
                },
              ],
            };
            yield {
              id: 'chatcmpl-1',
              object: 'chat.completion.chunk',
              created: 0,
              model: 'test-model',
              choices: [
                {
                  index: 0,
                  delta: {},
                  finish_reason: 'stop',
                },
              ],
            };
          })(),
          {
            protocol: 'openai',
          }
        );
        stream.pipe(res);
      });
      port = await listen(server);

      const client = new OpenAI({
        apiKey: 'test',
        baseURL: `http://localhost:${port}/v1`,
      });
      const upstream = await client.chat.completions.create({
        model: 'test-model',
        messages: [{ role: 'user', content: 'hi' }],
        stream: true,
      });
      const chunks = [];

      for await (const chunk of upstream) {
        chunks.push(chunk);
      }

      server.close();

      expect(chunks.length).toEqual(2);
      expect(chunks[0].choices[0].delta.content).toEqual('hello');
      expect(chunks[1].choices[0].finish_reason).toEqual('stop');
    });

    it('should forward anthropic protocol stream that anthropic sdk can consume', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();

        stream.forward(
          (async function* () {
            yield {
              type: 'message_start',
              message: {
                id: 'msg_1',
                type: 'message',
                role: 'assistant',
                model: 'test-model',
                content: [],
                stop_reason: null,
                stop_sequence: null,
                stop_details: null,
                container: null,
                usage: {
                  input_tokens: 1,
                  output_tokens: 0,
                  cache_creation: null,
                  cache_creation_input_tokens: null,
                  cache_read_input_tokens: null,
                  inference_geo: null,
                  server_tool_use: null,
                  service_tier: null,
                },
              },
            };
            yield {
              type: 'content_block_start',
              index: 0,
              content_block: {
                type: 'text',
                text: '',
              },
            };
            yield {
              type: 'content_block_delta',
              index: 0,
              delta: {
                type: 'text_delta',
                text: 'hello',
              },
            };
            yield {
              type: 'content_block_stop',
              index: 0,
            };
            yield {
              type: 'message_delta',
              delta: {
                stop_reason: 'end_turn',
                stop_sequence: null,
              },
              usage: {
                input_tokens: 1,
                output_tokens: 1,
              },
            };
            yield {
              type: 'message_stop',
            };
          })(),
          {
            protocol: 'anthropic',
          }
        );
        stream.pipe(res);
      });
      port = await listen(server);

      const client = new Anthropic({
        apiKey: 'test',
        baseURL: `http://localhost:${port}`,
      });
      const upstream = client.messages.stream({
        model: 'test-model',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'hi' }],
      });
      const events = [];

      for await (const event of upstream) {
        events.push(event);
      }

      server.close();

      expect(events.map(event => event.type)).toEqual([
        'message_start',
        'content_block_start',
        'content_block_delta',
        'content_block_stop',
        'message_delta',
        'message_stop',
      ]);
      expect(events[2].delta.text).toEqual('hello');
    });
  });

  describe('test stream in base http', () => {
    it('should test stream write', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).stream();
        Promise.resolve().then(async () => {
          stream.write('abc');
          await sleep();
          stream.write('bcd');
          await sleep();
          stream.write('bcd'.repeat(1000));
          stream.end();
        }).catch(console.error);
        stream.pipe(res);
      });
      port = await listen(server);

      let result = '';
      await new Promise<void>(resolve => {
        const req = request({
          hostname: 'localhost',
          port,
        }, res => {
          res.on('data', (chunk) => {
            result += chunk.toString();
          });

          res.on('end', () => {
            resolve();
          });

          res.on('error', (e) => {
            console.error(e.message);
          });
        });
        req.on('error', (e) => {
          console.error(e.message);
        });
        req.end();
      });
      server.close();
      await sleep(1000);
      expect(result).toEqual('abcbcd' + 'bcd'.repeat(1000));
    });

    it('should server response throw error', async () => {
      let port: number;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).stream();

        Promise.resolve().then(async () => {
          // use write
          stream.write('<body>');
          await sleep();
          stream.send('hello');
          await sleep();
          stream.sendError(new Error('test error'));
          stream.send('</body>');
        });
        stream.pipe(res);
      });
      port = await listen(server);

      let result = '';
      await new Promise<void>((resolve, reject) => {
        const req = request({
          hostname: 'localhost',
          port,
        }, res => {
          res.on('data', (chunk) => {
            result += chunk.toString();
          });

          res.on('end', () => {
            resolve();
          });

          res.on('error', (e) => {
            console.error(e.message);
          });
        });
        req.on('error', (e) => {
          console.error(e.message);
        });
        req.end();
      });
      server.close();
      await sleep(1000);
      expect(result).toEqual('<body>hello');
    });

    it('should test stream write with tpl', async () => {
      let port: number;
      const server = createServer((req, res) => {

        HttpServerResponse.STREAM_TPL = (chunk) => {
          chunk += 'hhhh';
          return chunk;
        };

        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).stream();
        Promise.resolve().then(async () => {
          stream.send('abc');
          await sleep();
          stream.send('bcd');
          await sleep();
          stream.send('bcd'.repeat(1000));
          stream.end();
        }).catch(console.error);
        stream.pipe(res);
      });
      port = await listen(server);

      let result = '';
      await new Promise<void>(resolve => {
        const req = request({
          hostname: 'localhost',
          port,
        }, res => {
          res.on('data', (chunk) => {
            result += chunk.toString();
          });

          res.on('end', () => {
            resolve();
          });

          res.on('error', (e) => {
            console.error(e.message);
          });
        });
        req.on('error', (e) => {
          console.error(e.message);
        });
        req.end();
      });
      server.close();
      await sleep(1000);
      expect(result).toEqual('abchhhhbcdhhhh' + 'bcd'.repeat(1000) + 'hhhh');
    });
  });

  describe('test base response', () => {
    it('should test set status and header', () => {
      const ctx = {
        logger: console,
        res: new ServerResponse({} as any),
      } as any;
      const res = new HttpServerResponse(ctx);
      res.status(200);
      expect(ctx.res.statusCode).toEqual(200);
      res.header('Content-Type', 'text/html');
      expect(ctx.res.getHeader('Content-Type')).toEqual('text/html');
      res.headers({
        'Content-Type': 'text/plain',
        'Content-Length': '100'
      });

      expect(ctx.res.getHeader('Content-Type')).toEqual('text/plain');
      expect(ctx.res.getHeader('Content-Length')).toEqual('100');
    });

    it('should test json and text', () => {
      const ctx = {
        logger: console,
        res: new ServerResponse({} as any),
      } as any;
      const res = new HttpServerResponse(ctx);
      const json = res.success().json({ a: 1 });
      expect(JSON.stringify(json)).toEqual('{"success":"true","data":{"a":1}}');
      let text = res.fail().text('hello');
      expect(text).toEqual('hello');
      HttpServerResponse.TEXT_TPL = (data: string, isSuccess) => {
        return isSuccess ? {
          success: 'true',
          data,
        } : {
          success: 'false',
          message: data || 'fail',
        };
      }
      text = res.fail().text('hello');
      expect(JSON.stringify(text)).toEqual('{"success":"false","message":"hello"}');
    });

    it('should test file with default content type', async () => {
      const ctx = {
        logger: console,
        res: new ServerResponse({} as any),
      } as any;
      const res = new HttpServerResponse(ctx);
      const filePath = join(__dirname, '../../package.json');
      const file = res.file(filePath);

      expect(ctx.res.getHeader('Content-Type')).toBe('application/octet-stream');
      expect(ctx.res.getHeader('Content-Disposition')).toBe('attachment; filename=package.json');

      // create stream get data from res
      let fileStream = createWriteStream(join(__dirname, 'package.json'));
      file.pipe(fileStream);
      await once(fileStream, 'finish');
      expect(existsSync(join(__dirname, 'package.json'))).toBeTruthy();
      // read
      const content = readFileSync(join(__dirname, 'package.json'), 'utf-8');
      expect(content).toMatch(/@midwayjs\/core/);
      unlinkSync(join(__dirname, 'package.json'));
    });

    it('should test file', async () => {
      const ctx = {
        logger: console,
        res: new ServerResponse({} as any),
      } as any;
      const res = new HttpServerResponse(ctx);
      const filePath = join(__dirname, '../../package.json');
      const file = res.file(filePath, 'application/json');

      expect(ctx.res.getHeader('Content-Type')).toBe('application/json');
      expect(ctx.res.getHeader('Content-Disposition')).toBe('attachment; filename=package.json');

      // create stream get data from res
      let fileStream = createWriteStream(join(__dirname, 'package.json'));
      file.pipe(fileStream);
      await once(fileStream, 'finish');
      expect(existsSync(join(__dirname, 'package.json'))).toBeTruthy();
      // read
      const content = readFileSync(join(__dirname, 'package.json'), 'utf-8');
      expect(content).toMatch(/@midwayjs\/core/);
      unlinkSync(join(__dirname, 'package.json'));
    });

    it("should test html response", () => {
      HttpServerResponse.HTML_TPL = (data, isSuccess, ctx) => {
        return `<div>${data}</div>`;
      }
      const ctx = {
        logger: console,
        res: new ServerResponse({} as any),
      } as any;
      const res = new HttpServerResponse(ctx);
      const html = res.html('hello');
      expect(html).toEqual('<div>hello</div>');
      expect(ctx.res.getHeader('Content-Type')).toBe('text/html');
    });

    it("should test redirect response", () => {
      const ctx = {
        logger: console,
        res: new ServerResponse({} as any),
      } as any;
      const res = new HttpServerResponse(ctx);
      res.redirect('https://www.baidu.com');
      expect(ctx.res.getHeader('Location')).toBe('https://www.baidu.com');
      expect(ctx.res.statusCode).toBe(302);
    });
  });
});
