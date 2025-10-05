import { createApp, close } from '@midwayjs/mock';
import * as mcp from '../src';
import { CallToolResult, GetPromptResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import * as express from '@midwayjs/express';
import { SSEMCPClientManager } from './sse-client-utils';
import { DefaultConsoleLoggerFactory } from '@midwayjs/core';
import { z } from 'zod';

describe('/test/index.test.ts', () => {

  it('should test mcp sse transport with utility', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server for SSE endpoint
      @mcp.Tool('toolC', { description: 'this is tool C for SSE' })
      class ToolC implements mcp.IMcpTool {
        name = 'toolC';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'hello sse mcp' }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          ToolC,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7002,
          },
          mcp: {
            serverInfo: {
              name: 'test-sse-mcp',
              version: '1.0.0',
            },
            transportType: 'sse',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create SSE MCP client using utility
      const client = await clientManager.createTestClient('http://localhost:7002/sse', 'test-sse-client');

      // List tools
      const { tools } = await client.listTools();
      const toolC = tools.find(tool => tool.name === 'toolC');
      
      if (!toolC) {
        throw new Error('toolC should be available in SSE transport');
      }

      // Call a tool
      const result = await client.callTool({
        name: 'toolC',
        arguments: {}
      });
      
      if (!result.content || result.content[0]?.text !== 'hello sse mcp') {
        throw new Error('SSE Tool call should return expected result');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test mcp stream http transport with utility', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server for StreamHTTP endpoint
      @mcp.Tool('toolD', { description: 'this is tool D for StreamHTTP' })
      class ToolD implements mcp.IMcpTool {
        name = 'toolD';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'hello stream http mcp' }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          ToolD,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7003,
          },
          mcp: {
            serverInfo: {
              name: 'test-stream-http-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create StreamHTTP MCP client using utility
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7003/mcp', 'test-stream-http-client');

      // List tools
      const { tools } = await client.listTools();
      const toolD = tools.find(tool => tool.name === 'toolD');
      
      if (!toolD) {
        throw new Error('toolD should be available in StreamHTTP transport');
      }

      // Call a tool
      const result = await client.callTool({
        name: 'toolD',
        arguments: {}
      });
      
      if (!result.content || result.content[0]?.text !== 'hello stream http mcp') {
        throw new Error('StreamHTTP Tool call should return expected result');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test stream-http transport backward compatibility with sse client', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server with stream-http transport type
      @mcp.Tool('toolE', { description: 'this is tool E for backward compatibility test' })
      class ToolE implements mcp.IMcpTool {
        name = 'toolE';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'hello backward compatible mcp' }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          ToolE,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7005,
          },
          mcp: {
            serverInfo: {
              name: 'test-backward-compat-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http', // Server uses stream-http
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Wait a bit for server to fully start
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 1: SSE client should now work with backward compatibility
      try {
        // With backward compatibility, SSE clients can connect via /sse endpoint
        const sseClient = await clientManager.createTestClient('http://localhost:7005/sse', 'test-sse-compat-client');
        
        // List tools
        const { tools } = await sseClient.listTools();
        const toolE = tools.find(tool => tool.name === 'toolE');
        
        if (!toolE) {
          throw new Error('toolE should be available via SSE client on stream-http server');
        }

        // Call a tool
        const result = await sseClient.callTool({
          name: 'toolE',
          arguments: {}
        });
        
        if (!result.content || result.content[0]?.text !== 'hello backward compatible mcp') {
          throw new Error('SSE client on stream-http server should return expected result');
        }

        console.log('✓ SSE client successfully connected to stream-http server with backward compatibility');
      } catch (error) {
        console.log('✗ SSE client failed to connect to stream-http server:', error.message);
        throw error; // Now we expect this to work, so throw the error if it fails
      }

      // Test 2: Verify StreamHTTP client still works
      const streamHttpClient = await clientManager.createTestStreamHTTPClient('http://localhost:7005/mcp', 'test-streamhttp-compat-client');
      
      // List tools
      const { tools } = await streamHttpClient.listTools();
      const toolE = tools.find(tool => tool.name === 'toolE');
      
      if (!toolE) {
        throw new Error('toolE should be available via StreamHTTP client');
      }

      // Call a tool
      const result = await streamHttpClient.callTool({
        name: 'toolE',
        arguments: {}
      });
      
      if (!result.content || result.content[0]?.text !== 'hello backward compatible mcp') {
        throw new Error('StreamHTTP client should return expected result');
      }

      console.log('✓ StreamHTTP client successfully connected to stream-http server');

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test mcp prompt functionality', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server with Prompt
      @mcp.Prompt('testPrompt', { description: 'this is a test prompt' })
      class TestPrompt implements mcp.IMcpPrompt {
        async generate(): Promise<GetPromptResult> {
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: 'Hello from test prompt'
                }
              }
            ]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          TestPrompt,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7006,
          },
          mcp: {
            serverInfo: {
              name: 'test-prompt-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create StreamHTTP MCP client
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7006/mcp', 'test-prompt-client');

      // List prompts
      const { prompts } = await client.listPrompts();
      const testPrompt = prompts.find(prompt => prompt.name === 'testPrompt');
      
      if (!testPrompt) {
        throw new Error('testPrompt should be available');
      }

      // Get prompt
      const result = await client.getPrompt({
        name: 'testPrompt',
        arguments: {}
      });
      
      if (!result.messages || result.messages.length === 0 || result.messages[0].content.text !== 'Hello from test prompt') {
        throw new Error('Prompt should return expected result');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test mcp resource functionality', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server with Resource
      @mcp.Resource('testResource', { uri: 'test://resource', description: 'this is a test resource' })
      class TestResource implements mcp.IMcpResource {
        async handle(): Promise<ReadResourceResult> {
          return {
            contents: [
              {
                uri: 'test://resource',
                mimeType: 'text/plain',
                text: 'Hello from test resource'
              }
            ]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          TestResource,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7007,
          },
          mcp: {
            serverInfo: {
              name: 'test-resource-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create StreamHTTP MCP client
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7007/mcp', 'test-resource-client');

      // List resources
      const { resources } = await client.listResources();
      const testResource = resources.find(resource => resource.name === 'testResource');
      
      if (!testResource) {
        throw new Error('testResource should be available');
      }

      // Read resource
      const result = await client.readResource({
        uri: 'test://resource'
      });
      
      if (!result.contents || result.contents.length === 0 || result.contents[0].text !== 'Hello from test resource') {
        throw new Error('Resource should return expected result');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test Tool decorator with Zod schema validation', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;

    try {
      // Start the app server with Tool decorator using Zod schema
      @mcp.Tool('zodValidatedTool', {
        description: 'Tool with Zod schema validation',
        inputSchema: {
          message: z.string().describe('Input message to process'),
          count: z.number().optional().describe('Optional count parameter'),
          priority: z.enum(['low', 'medium', 'high']).describe('Priority level')
        }
      })
      class ZodValidatedTool implements mcp.IMcpTool {
        name = 'zodValidatedTool';

        async execute(args: any): Promise<CallToolResult> {
          return {
            content: [{
              type: 'text',
              text: `Processed: ${args.message}, Count: ${args.count || 'not provided'}, Priority: ${args.priority}`
            }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          ZodValidatedTool,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7009,
          },
          mcp: {
            serverInfo: {
              name: 'test-zod-validation-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create StreamHTTP MCP client
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7009/mcp', 'test-zod-validation-client');

      // List tools
      const { tools } = await client.listTools();
      const zodTool = tools.find(tool => tool.name === 'zodValidatedTool');

      if (!zodTool) {
        throw new Error('zodValidatedTool should be available');
      }

      // Test valid arguments
      const validResult = await client.callTool({
        name: 'zodValidatedTool',
        arguments: {
          message: 'test message',
          count: 5,
          priority: 'high'
        }
      });

      if (!validResult.content || !validResult.content[0]?.text?.includes('Processed: test message, Count: 5, Priority: high')) {
        throw new Error('Tool should return expected result with valid arguments');
      }

      // Test with optional parameter omitted
      const partialResult = await client.callTool({
        name: 'zodValidatedTool',
        arguments: {
          message: 'another test',
          priority: 'low'
        }
      });

      if (!partialResult.content || !partialResult.content[0]?.text?.includes('Processed: another test, Count: not provided, Priority: low')) {
        throw new Error('Tool should work with optional parameters omitted');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test dynamic registration in onReady', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      app = await createApp({
        baseDir: null,
        imports: [
          express,
          mcp,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7008,
          },
          mcp: {
            serverInfo: {
              name: 'test-dynamic-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container) {
          const mcpFramework = await container.getAsync(mcp.MidwayMCPFramework);
          const server = mcpFramework.getServer();

          // Dynamic tool registration
          server.registerTool('dynamic_tool', {
            description: 'Dynamically registered tool',
            inputSchema: {
              message: z.string().describe('Message to process')
            }
          }, async (args): Promise<CallToolResult> => {
            return {
              content: [{
                type: 'text',
                text: `Dynamic processing: ${args.message}`
              }]
            };
          });

          // Dynamic prompt registration
          server.registerPrompt('dynamic_prompt', {
            description: 'Dynamically generated prompt',
            argsSchema: {
              topic: z.string().describe('Topic')
            }
          }, async (args) => {
            return {
              messages: [{
                role: 'user',
                content: {
                  type: 'text',
                  text: `Write an article about: ${args.topic}`
                }
              }]
            };
          });

          // Dynamic resource registration
          server.registerResource('Dynamic Config', 'dynamic://config', {
            description: 'Dynamically generated configuration resource',
            mimeType: 'application/json'
          }, async (uri) => {
            return {
              contents: [{
                uri: uri.toString(),
                mimeType: 'application/json',
                text: JSON.stringify({
                  timestamp: new Date().toISOString(),
                  config: 'dynamic data'
                })
              }]
            };
          });
        }
      });

      // Create StreamHTTP MCP client
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7008/mcp', 'test-dynamic-client');

      // Test dynamic tool
      const { tools } = await client.listTools();
      const dynamicTool = tools.find(tool => tool.name === 'dynamic_tool');
      
      if (!dynamicTool) {
        throw new Error('dynamic_tool should be available');
      }

      const toolResult = await client.callTool({
        name: 'dynamic_tool',
        arguments: { message: 'test message' }
      });

      if (!toolResult.content || !Array.isArray(toolResult.content) || toolResult.content.length === 0) {
        throw new Error('Tool should return content');
      }

      const toolContent = toolResult.content[0];
      if (toolContent.type !== 'text' || !('text' in toolContent) || !toolContent.text.includes('Dynamic processing: test message')) {
        throw new Error('Tool should return expected result');
      }

      // Test dynamic prompt
      const { prompts } = await client.listPrompts();
      const dynamicPrompt = prompts.find(prompt => prompt.name === 'dynamic_prompt');
      
      if (!dynamicPrompt) {
        throw new Error('dynamic_prompt should be available');
      }

      const promptResult = await client.getPrompt({
        name: 'dynamic_prompt',
        arguments: { topic: 'AI technology' }
      });

      if (!promptResult.messages || promptResult.messages.length === 0) {
        throw new Error('Prompt should return messages');
      }

      const promptMessage = promptResult.messages[0];
      if (promptMessage.role !== 'user' || 
          promptMessage.content.type !== 'text' || 
          !promptMessage.content.text.includes('Write an article about: AI technology')) {
        throw new Error('Prompt should return expected result');
      }

      // Test dynamic resource
      const { resources } = await client.listResources();
      const dynamicResource = resources.find(resource => resource.name === 'Dynamic Config');
      
      if (!dynamicResource) {
        throw new Error('Dynamic Config resource should be available');
      }

      const resourceResult = await client.readResource({
        uri: 'dynamic://config'
      });

      if (!resourceResult.contents || resourceResult.contents.length === 0) {
        throw new Error('Resource should return content');
      }

      const resourceContent = resourceResult.contents[0];
      if (resourceContent.mimeType !== 'application/json' || !resourceContent.text || typeof resourceContent.text !== 'string') {
        throw new Error('Resource should return JSON content');
      }

      const parsedContent = JSON.parse(resourceContent.text);
      if (!parsedContent.timestamp || parsedContent.config !== 'dynamic data') {
        throw new Error('Resource should return expected JSON structure');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });
})
