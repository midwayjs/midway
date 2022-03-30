import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  describe('test swagger', () => {

    let app;
    beforeAll(async () => {
      try {
        app = await createApp(join(__dirname, 'fixtures/cats'), {}, koa);
      } catch (e) {
        console.log(e);
        console.log('beforeAll: ' +  e.stack);
      }
    });

    afterAll(async () => {
      await close(app);
    });

    it('should get swagger json', async () => {
      let ret = await createHttpRequest(app).get('/swagger-ui/index.html');
      expect(ret.type).toEqual('text/html');
      expect(ret.text).toContain('html');
      
      ret = await createHttpRequest(app).get('/swagger-ui/swagger-ui.js');
      expect(ret.type).toEqual('application/javascript');
      expect(ret.text).toContain('!function');

      ret = await createHttpRequest(app).get('/swagger-ui/swagger-ui.css');
      expect(ret.type).toEqual('text/css');
      expect(ret.text).toContain('.swagger-ui{color:#3b4151');

      const result = await createHttpRequest(app).get('/swagger-ui/index.json');
      expect(result.type).toEqual('application/json');
      const body = result.body;
      // console.log('--->', result.text);

      expect(body.tags.length).toBeGreaterThanOrEqual(2);
      expect(body.tags).toStrictEqual([{"name":"1-你好这里","description":""},{"name":"2-国家测试","description":""},{"description":"","name":"sss"}]);
      expect(body.components.securitySchemes).toStrictEqual({"bbb":{"type":"http","scheme":"basic"},"ttt":{"type":"http","scheme":"bearer","bearerFormat":"JWT"}})
      expect(body.components.schemas.CatT).toStrictEqual({
        "type": "object",
        "properties": {
          "namedt": {
            "type": "string",
            "description": "The name of the Cat"
          },
          "agedt": {
            "type": "number",
            "description": "The age of ttthe Cat"
          },
          "breedtd": {
            "type": "string",
            "description": "The breed tttof the Cat"
          }
        },
        "example": {
          "namedt": "Kitty",
          "agedt": 1,
          "breedtd": "Maine Coon"
        }
      });
      expect(body.components.schemas.Catd).toStrictEqual({
        "type": "object",
        "properties": {
          "named": {
            "type": "string",
            "description": "The name of the Cat"
          },
          "aged": {
            "type": "number",
            "description": "The age of the Cat"
          },
          "breedd": {
            "type": "string",
            "description": "The breed of the Cat"
          }
        },
        "example": {
          "named": "Kitty",
          "aged": 1,
          "breedd": "Maine Coon"
        }
      });

      expect(body.components.schemas.Cata).toStrictEqual({
        "type": "object",
        "properties": {
          "namea": {
            "type": "string",
            "description": "The name aaof the Cat"
          },
          "agea": {
            "type": "number",
            "description": "The age of thaae Cat"
          },
          "breeda": {
            "type": "string",
            "description": "The breed of taahe Cat"
          },
          "catdsa": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Catd"
            },
            "description": "The breed of the Cat"
          }
        },
        "example": {
          "namea": "Kitty",
          "agea": 1,
          "breeda": "Maine Coon"
        }
      });

      expect(body.components.schemas.Cat).toStrictEqual({
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the Cat"
          },
          "age": {
            "type": "number",
            "description": "The age of the Cat"
          },
          "breed": {
            "type": "string",
            "description": "The breed of the Cat"
          },
          "catds": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Catd"
            },
            "description": "The breed of the Cat"
          }
        },
        "example": {
          "name": "Kitty",
          "age": 1,
          "breed": "Maine Coon"
        }
      });

      expect(body.components.schemas.CreateCatDto).toStrictEqual({
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "format": "binary",
            "description": "The name of the Catname"
          },
          "age": {
            "type": "number",
            "description": "The name of the Catage",
            "maximum": 10,
            "maxItems": 1,
            "maxLength": 1,
            "maxProperties": 2
          },
          "breed": {
            "type": "string",
            "description": "The name of the Catbreed"
          },
          "breeds": {
            "type": "array",
            "items": {},
            "description": "The name of the Catage",
            "nullable": true,
            "uniqueItems": true
          },
          "hello": {
            "type": "string",
            "enum": [
              "One",
              "Two",
              "Three"
            ]
          }
        },
        "example": {
          "name": "Kitty",
          "age": "1",
          "breed": "bbbb",
          "breeds": [
            "1"
          ]
        }
      });


      expect(body.paths['/cats/{id}']).toStrictEqual({
        "post": {
          "summary": "Create cat",
          "tags": [
            "2-国家测试",
            "sss"
          ],
          "requestBody": {
            "required": true,
            "description": "hello world",
            "content": {
              "application/octet-stream": {
                "schema": {
                  "type": "string",
                  "format": "binary"
                }
              }
            }
          },
          "parameters": [
            {
              "name": "x-test-one",
              "in": "header",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "number",
                "format": "int32"
              },
              "description": "hello world id number",
              "example": 12,
              "style": "simple",
              "explode": false
            }
          ],
          "responses": {
            "200": {
              "description": "成功了",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Cat"
                  }
                }
              }
            },
            "403": {
              "description": "Forbidden."
            },
            "404": {
              "description": "NotFound."
            }
          },
          "security": [
            {
              "ttt": []
            },
            {
              "bbb": []
            }
          ]
        },
        "get": {
          "tags": [
            "2-国家测试",
            "sss"
          ],
          "parameters": [
            {
              "name": "x-test-one",
              "in": "header",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "aa",
              "in": "query",
              "required": true,
              "schema": {
                "enum": [
                  "One",
                  "Two",
                  "Three"
                ],
                "type": "string"
              },
              "allowEmptyValue": false,
              "style": "form",
              "explode": true
            },
            {
              "name": "test",
              "in": "query",
              "required": true,
              "schema": {
                "enum": [
                  "One",
                  "Two",
                  "Three"
                ],
                "type": "string"
              },
              "allowEmptyValue": false,
              "style": "form",
              "explode": true
            },
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "hello world id number",
              "example": 12,
              "style": "simple",
              "explode": false
            }
          ],
          "responses": {
            "200": {
              "description": "The found record",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Cat"
                  }
                }
              }
            }
          },
          "x-hello": {
            "hello": "world"
          },
          "security": [
            {
              "ttt": []
            },
            {
              "bbb": []
            }
          ]
        }
      });
    });
  });
});