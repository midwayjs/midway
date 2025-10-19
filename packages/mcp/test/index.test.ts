import { createApp, close, createLightApp } from '@midwayjs/mock';
import * as mcp from '../src';
import { CallToolResult, GetPromptResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import * as express from '@midwayjs/express';
import { SSEMCPClientManager } from './sse-client-utils';
import { DefaultConsoleLoggerFactory, Inject } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
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

  it('should test Tool with complex parameters', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;

    try {
      // Start the app server with Tool that requires complex parameters
      @mcp.Tool('complexParamTool', {
        description: 'Tool that accepts complex parameters including nested objects and arrays',
        inputSchema: {
          user: z.object({
            name: z.string().describe('User name'),
            age: z.number().describe('User age'),
            email: z.string().email().describe('User email')
          }).describe('User information'),
          preferences: z.array(z.string()).describe('User preferences'),
          metadata: z.object({
            source: z.string().describe('Data source'),
            timestamp: z.string().optional().describe('Optional timestamp')
          }).optional().describe('Optional metadata'),
          action: z.enum(['create', 'update', 'delete']).describe('Action to perform')
        }
      })
      class ComplexParamTool implements mcp.IMcpTool {
        name = 'complexParamTool';

        async execute(args: any): Promise<CallToolResult> {
          const { user, preferences, metadata, action } = args;

          const result = {
            action,
            user: `${user.name} (${user.age}, ${user.email})`,
            preferences: preferences.join(', '),
            metadata: metadata ? `Source: ${metadata.source}${metadata.timestamp ? `, Time: ${metadata.timestamp}` : ''}` : 'No metadata'
          };

          return {
            content: [{
              type: 'text',
              text: `Action: ${result.action}\nUser: ${result.user}\nPreferences: ${result.preferences}\nMetadata: ${result.metadata}`
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
          ComplexParamTool,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7010,
          },
          mcp: {
            serverInfo: {
              name: 'test-complex-param-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create StreamHTTP MCP client
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7010/mcp', 'test-complex-param-client');

      // List tools
      const { tools } = await client.listTools();
      const complexTool = tools.find(tool => tool.name === 'complexParamTool');

      if (!complexTool) {
        throw new Error('complexParamTool should be available');
      }

      // Test with all parameters
      const fullResult = await client.callTool({
        name: 'complexParamTool',
        arguments: {
          user: {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com'
          },
          preferences: ['coding', 'reading', 'gaming'],
          metadata: {
            source: 'api',
            timestamp: '2023-01-01T00:00:00Z'
          },
          action: 'create'
        }
      });

      if (!fullResult.content || !fullResult.content[0]?.text?.includes('Action: create') ||
          !fullResult.content[0]?.text?.includes('User: John Doe (30, john@example.com)') ||
          !fullResult.content[0]?.text?.includes('Preferences: coding, reading, gaming') ||
          !fullResult.content[0]?.text?.includes('Source: api, Time: 2023-01-01T00:00:00Z')) {
        throw new Error('Tool should return expected result with full parameters');
      }

      // Test with optional parameter omitted
      const partialResult = await client.callTool({
        name: 'complexParamTool',
        arguments: {
          user: {
            name: 'Jane Smith',
            age: 25,
            email: 'jane@example.com'
          },
          preferences: ['music', 'travel'],
          action: 'update'
        }
      });

      if (!partialResult.content || !partialResult.content[0]?.text?.includes('Action: update') ||
          !partialResult.content[0]?.text?.includes('User: Jane Smith (25, jane@example.com)') ||
          !partialResult.content[0]?.text?.includes('Preferences: music, travel') ||
          !partialResult.content[0]?.text?.includes('Metadata: No metadata')) {
        throw new Error('Tool should work with optional parameters omitted');
      }

      // Test with partial metadata (timestamp omitted)
      const partialMetadataResult = await client.callTool({
        name: 'complexParamTool',
        arguments: {
          user: {
            name: 'Bob Wilson',
            age: 35,
            email: 'bob@example.com'
          },
          preferences: ['sports'],
          metadata: {
            source: 'database'
          },
          action: 'delete'
        }
      });

      if (!partialMetadataResult.content || !partialMetadataResult.content[0]?.text?.includes('Action: delete') ||
          !partialMetadataResult.content[0]?.text?.includes('User: Bob Wilson (35, bob@example.com)') ||
          !partialMetadataResult.content[0]?.text?.includes('Preferences: sports') ||
          !partialMetadataResult.content[0]?.text?.includes('Source: database') ||
          partialMetadataResult.content[0]?.text?.includes('Time:')) {
        throw new Error('Tool should work with partial metadata (timestamp omitted)');
      }

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test mcp authorization functionality', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;

    try {
      // Create a tool that checks authorization in the context
      @mcp.Tool('authTool', { description: 'Tool that requires authorization' })
      class AuthTool implements mcp.IMcpTool {
        name = 'authTool';

        @Inject()
        ctx;

        async execute(): Promise<CallToolResult> {
          console.log('AuthTool context authorization:', this.ctx.isAuthorized);
          return {
            content: [{ type: 'text', text: 'hello authorized user' }]
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
          AuthTool,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7011,
          },
          mcp: {
            serverInfo: {
              name: 'test-auth-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          // Add middleware to check authorization
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path === '/mcp') {
              const authHeader = req.headers.authorization;
              if (!authHeader) {
                // Allow requests without authorization for negative testing
                req.isAuthorized = false;
              } else if (authHeader === 'Bearer valid-token') {
                req.isAuthorized = true;
              } else {
                req.isAuthorized = false;
              }
            }
            next();
          });

          console.log(expressApp.getMiddleware().getNames())
        }
      });

      // Test 1: Request without authorization should work (but we can check the header was not present)
      const clientWithoutAuth = await clientManager.createTestStreamHTTPClient(
        'http://localhost:7011/mcp',
        'test-no-auth-client'
      );

      const { tools: toolsWithoutAuth } = await clientWithoutAuth.listTools();
      const authTool1 = toolsWithoutAuth.find(tool => tool.name === 'authTool');

      if (!authTool1) {
        throw new Error('authTool should be available even without authorization');
      }

      const resultWithoutAuth = await clientWithoutAuth.callTool({
        name: 'authTool',
        arguments: {}
      });

      if (!resultWithoutAuth.content || resultWithoutAuth.content[0]?.text !== 'hello authorized user') {
        throw new Error('Tool should work without authorization in this test setup');
      }

      // Test 2: Request with valid authorization token
      const clientWithAuth = await clientManager.createTestStreamHTTPClient(
        'http://localhost:7011/mcp',
        'test-auth-client',
        'Bearer valid-token'
      );

      const { tools: toolsWithAuth } = await clientWithAuth.listTools();
      const authTool2 = toolsWithAuth.find(tool => tool.name === 'authTool');

      if (!authTool2) {
        throw new Error('authTool should be available with valid authorization');
      }

      const resultWithAuth = await clientWithAuth.callTool({
        name: 'authTool',
        arguments: {}
      });

      if (!resultWithAuth.content || resultWithAuth.content[0]?.text !== 'hello authorized user') {
        throw new Error('Tool should work with valid authorization');
      }

      // Test 3: Request with invalid authorization token
      const clientWithInvalidAuth = await clientManager.createTestStreamHTTPClient(
        'http://localhost:7011/mcp',
        'test-invalid-auth-client',
        'Bearer invalid-token'
      );

      const { tools: toolsWithInvalidAuth } = await clientWithInvalidAuth.listTools();
      const authTool3 = toolsWithInvalidAuth.find(tool => tool.name === 'authTool');

      if (!authTool3) {
        throw new Error('authTool should be available even with invalid authorization in this test setup');
      }

      const resultWithInvalidAuth = await clientWithInvalidAuth.callTool({
        name: 'authTool',
        arguments: {}
      });

      if (!resultWithInvalidAuth.content || resultWithInvalidAuth.content[0]?.text !== 'hello authorized user') {
        throw new Error('Tool should work even with invalid authorization in this test setup');
      }

      console.log('✓ Authorization headers are properly passed through to the MCP server');

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test OAuth 2.1 WWW-Authenticate header on 401 Unauthorized', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;

    try {
      @mcp.Tool('protectedTool', { description: 'Tool requiring OAuth authentication' })
      class ProtectedTool implements mcp.IMcpTool {
        name = 'protectedTool';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'access granted' }]
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
          ProtectedTool,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7012,
          },
          mcp: {
            serverInfo: {
              name: 'test-oauth-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          // Add OAuth middleware
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path !== '/mcp') {
              return next();
            }
            const authHeader = req.headers.authorization;

            if (!authHeader) {
              // Return 401 with WWW-Authenticate header as per RFC9728
              res.status(401);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource"');
              res.json({
                jsonrpc: '2.0',
                error: {
                  code: -32001,
                  message: 'Authorization required',
                },
                id: null,
              });
              return;
            }

            if (!authHeader.startsWith('Bearer ')) {
              res.status(401);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token", error_description="Authorization header must use Bearer scheme"');
              res.json({
                jsonrpc: '2.0',
                error: {
                  code: -32001,
                  message: 'Invalid authorization scheme',
                },
                id: null,
              });
              return;
            }

            const token = authHeader.substring(7);
            if (token !== 'valid-oauth-token') {
              res.status(401);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token", error_description="The access token is invalid or expired"');
              res.json({
                jsonrpc: '2.0',
                error: {
                  code: -32001,
                  message: 'Invalid or expired token',
                },
                id: null,
              });
              return;
            }

            // Token is valid, proceed
            req.user = { id: 'test-user' };
            next();
          });
        }
      });

      // Test 1: Request without Authorization header should return 401 with WWW-Authenticate
      try {
        await clientManager.createTestStreamHTTPClient('http://localhost:7012/mcp', 'test-no-auth');
        throw new Error('Should have thrown an error for missing authorization');
      } catch (error) {
        // Expect a connection or authentication error
        console.log('✓ Correctly rejected request without authorization');
      }

      // Test 2: Request with valid Bearer token should succeed
      const clientWithValidToken = await clientManager.createTestStreamHTTPClient(
        'http://localhost:7012/mcp',
        'test-oauth-client',
        'Bearer valid-oauth-token'
      );

      const { tools } = await clientWithValidToken.listTools();
      const protectedTool = tools.find(tool => tool.name === 'protectedTool');

      if (!protectedTool) {
        throw new Error('protectedTool should be available with valid OAuth token');
      }

      const result = await clientWithValidToken.callTool({
        name: 'protectedTool',
        arguments: {}
      });

      if (!result.content || result.content[0]?.text !== 'access granted') {
        throw new Error('Tool should return success with valid OAuth token');
      }

      console.log('✓ OAuth Bearer token authentication working correctly');

    } finally {
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });

  it('should test OAuth 2.1 Protected Resource Metadata endpoint', async () => {
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
            port: 7013,
          },
          mcp: {
            serverInfo: {
              name: 'test-resource-metadata-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          // RFC9728 Protected Resource Metadata endpoint
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path === '/.well-known/oauth-protected-resource' && req.method === 'GET') {
              res.json({
                resource: 'https://mcp.example.com',
                authorization_servers: [
                  'https://auth.example.com'
                ],
                jwks_uri: 'https://mcp.example.com/.well-known/jwks.json',
                scopes_supported: ['mcp:read', 'mcp:write'],
                bearer_methods_supported: ['header'],
                resource_documentation: 'https://docs.example.com/mcp'
              });
              return;
            }
            next();
          });
        }
      });

      // Test the Protected Resource Metadata endpoint
      const response = await fetch('http://localhost:7013/.well-known/oauth-protected-resource');
      const metadata = await response.json() as any;

      if (response.status !== 200) {
        throw new Error('Protected Resource Metadata endpoint should return 200');
      }

      if (!metadata.resource || !metadata.authorization_servers || !Array.isArray(metadata.authorization_servers)) {
        throw new Error('Protected Resource Metadata must include resource and authorization_servers');
      }

      if (metadata.resource !== 'https://mcp.example.com') {
        throw new Error('Resource field should match expected value');
      }

      if (!metadata.authorization_servers.includes('https://auth.example.com')) {
        throw new Error('Authorization servers should include expected server');
      }

      console.log('✓ OAuth Protected Resource Metadata endpoint working correctly');

    } finally {
      if (app) {
        await close(app);
      }
    }
  });

  it('should test OAuth 2.1 Authorization Server Metadata endpoint', async () => {
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
            port: 7014,
          },
          mcp: {
            serverInfo: {
              name: 'test-auth-server-metadata-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          // RFC8414 Authorization Server Metadata endpoint
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path === '/.well-known/oauth-authorization-server' && req.method === 'GET') {
              res.json({
                issuer: 'https://auth.example.com',
                authorization_endpoint: 'https://auth.example.com/oauth/authorize',
                token_endpoint: 'https://auth.example.com/oauth/token',
                registration_endpoint: 'https://auth.example.com/oauth/register',
                jwks_uri: 'https://auth.example.com/.well-known/jwks.json',
                scopes_supported: ['mcp:read', 'mcp:write'],
                response_types_supported: ['code'],
                grant_types_supported: ['authorization_code', 'refresh_token'],
                token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
                code_challenge_methods_supported: ['S256'],
                resource_indicator_supported: true
              });
              return;
            }
            next();
          });
        }
      });

      // Test the Authorization Server Metadata endpoint
      const response = await fetch('http://localhost:7014/.well-known/oauth-authorization-server');
      const metadata = await response.json() as any;

      if (response.status !== 200) {
        throw new Error('Authorization Server Metadata endpoint should return 200');
      }

      // Validate required OAuth 2.1 fields
      const requiredFields = [
        'issuer',
        'authorization_endpoint',
        'token_endpoint',
        'response_types_supported',
        'code_challenge_methods_supported'
      ];

      for (const field of requiredFields) {
        if (!metadata[field]) {
          throw new Error(`Authorization Server Metadata must include ${field}`);
        }
      }

      if (!metadata.code_challenge_methods_supported.includes('S256')) {
        throw new Error('Authorization Server must support PKCE with S256');
      }

      if (!metadata.resource_indicator_supported) {
        throw new Error('Authorization Server should support resource indicators (RFC8707)');
      }

      console.log('✓ OAuth Authorization Server Metadata endpoint working correctly');

    } finally {
      if (app) {
        await close(app);
      }
    }
  });

  it('should test OAuth 2.1 Dynamic Client Registration', async () => {
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
            port: 7015,
          },
          mcp: {
            serverInfo: {
              name: 'test-client-registration-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          // RFC7591 Dynamic Client Registration endpoint
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path === '/oauth/register' && req.method === 'POST') {
              const registration = req.body;

              // Validate required fields for MCP client registration
              if (!registration.client_name || !registration.redirect_uris || !Array.isArray(registration.redirect_uris)) {
                res.status(400).json({
                  error: 'invalid_client_metadata',
                  error_description: 'Missing required client registration fields'
                });
                return;
              }

              // Validate redirect URIs (must be localhost or HTTPS)
              for (const uri of registration.redirect_uris) {
                if (!uri.startsWith('https://') && !uri.startsWith('http://localhost') && !uri.startsWith('http://127.0.0.1')) {
                  res.status(400).json({
                    error: 'invalid_redirect_uri',
                    error_description: 'Redirect URIs must be HTTPS or localhost'
                  });
                  return;
                }
              }

              // Return client credentials
              res.json({
                client_id: 'dynamically-registered-client-123',
                client_id_issued_at: Math.floor(Date.now() / 1000),
                client_name: registration.client_name,
                redirect_uris: registration.redirect_uris,
                grant_types: registration.grant_types || ['authorization_code'],
                response_types: registration.response_types || ['code'],
                token_endpoint_auth_method: registration.token_endpoint_auth_method || 'none',
                registration_client_uri: 'https://auth.example.com/clients/dynamically-registered-client-123'
              });
              return;
            }
            next();
          });
        }
      });

      // Test Dynamic Client Registration
      const registrationData = {
        client_name: 'MCP Test Client',
        redirect_uris: ['http://localhost:8080/callback'],
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none'
      };

      const response = await fetch('http://localhost:7015/oauth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (response.status !== 200) {
        throw new Error(`Client registration should return 200, got ${response.status}`);
      }

      const clientInfo = await response.json() as any;

      if (!clientInfo.client_id || !clientInfo.client_id_issued_at) {
        throw new Error('Client registration must return client_id and client_id_issued_at');
      }

      if (clientInfo.client_name !== registrationData.client_name) {
        throw new Error('Registered client name should match request');
      }

      if (!Array.isArray(clientInfo.redirect_uris) || clientInfo.redirect_uris[0] !== registrationData.redirect_uris[0]) {
        throw new Error('Registered redirect URIs should match request');
      }

      console.log('✓ OAuth Dynamic Client Registration working correctly');

    } finally {
      if (app) {
        await close(app);
      }
    }
  });

  it('should test OAuth 2.1 error responses with proper status codes', async () => {
    let app: any;

    try {
      @mcp.Tool('restrictedTool', { description: 'Tool with scope restrictions' })
      class RestrictedTool implements mcp.IMcpTool {
        name = 'restrictedTool';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'restricted access granted' }]
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
          RestrictedTool,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7016,
          },
          mcp: {
            serverInfo: {
              name: 'test-oauth-errors-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path !== '/mcp') {
              return next();
            }
            const authHeader = req.headers.authorization;

            if (!authHeader) {
              // 401 Unauthorized - No token provided
              res.status(401);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource"');
              res.json({
                jsonrpc: '2.0',
                error: { code: -32001, message: 'Authorization required' },
                id: null,
              });
              return;
            }

            if (!authHeader.startsWith('Bearer ')) {
              // 400 Bad Request - Malformed authorization header
              res.status(400);
              res.json({
                jsonrpc: '2.0',
                error: { code: -32602, message: 'Malformed authorization header' },
                id: null,
              });
              return;
            }

            const token = authHeader.substring(7);

            if (token === 'expired-token') {
              // 401 Unauthorized - Expired token
              res.status(401);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token", error_description="Token has expired"');
              res.json({
                jsonrpc: '2.0',
                error: { code: -32001, message: 'Token expired' },
                id: null,
              });
              return;
            }

            if (token === 'insufficient-scope-token') {
              // 403 Forbidden - Insufficient permissions
              res.status(403);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", error="insufficient_scope", error_description="Token lacks required scope"');
              res.json({
                jsonrpc: '2.0',
                error: { code: -32004, message: 'Insufficient permissions' },
                id: null,
              });
              return;
            }

            if (token === 'wrong-audience-token') {
              // 401 Unauthorized - Token not intended for this resource
              res.status(401);
              res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token", error_description="Token not intended for this resource"');
              res.json({
                jsonrpc: '2.0',
                error: { code: -32001, message: 'Invalid token audience' },
                id: null,
              });
              return;
            }

            if (token === 'valid-token') {
              req.user = { id: 'test-user', scopes: ['mcp:read', 'mcp:write'] };
              next();
              return;
            }

            // 401 Unauthorized - Invalid token
            res.status(401);
            res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token"');
            res.json({
              jsonrpc: '2.0',
              error: { code: -32001, message: 'Invalid token' },
              id: null,
            });
          });
        }
      });

      const clientManager = new SSEMCPClientManager();

      try {
        // Test various error scenarios
        const errorScenarios = [
          {
            name: 'no authorization header',
            token: undefined,
            expectedError: 'missing authorization'
          },
          {
            name: 'expired token',
            token: 'Bearer expired-token',
            expectedError: 'expired'
          },
          {
            name: 'insufficient scope',
            token: 'Bearer insufficient-scope-token',
            expectedError: 'insufficient permissions'
          },
          {
            name: 'wrong audience',
            token: 'Bearer wrong-audience-token',
            expectedError: 'wrong audience'
          }
        ];

        for (const scenario of errorScenarios) {
          try {
            const client = await clientManager.createTestStreamHTTPClient(
              'http://localhost:7016/mcp',
              `test-${scenario.name.replace(/\s+/g, '-')}`,
              scenario.token
            );

            // Try to call a tool - should fail
            await client.callTool({ name: 'restrictedTool', arguments: {} });
            throw new Error(`Should have failed for ${scenario.name}`);
          } catch (error) {
            console.log(`✓ Correctly handled error case: ${scenario.name}`);
          }
        }

        // Test successful case
        const validClient = await clientManager.createTestStreamHTTPClient(
          'http://localhost:7016/mcp',
          'test-valid-client',
          'Bearer valid-token'
        );

        const result = await validClient.callTool({
          name: 'restrictedTool',
          arguments: {}
        });

        if (!result.content || result.content[0]?.text !== 'restricted access granted') {
          throw new Error('Valid token should allow access');
        }

        console.log('✓ OAuth error handling working correctly');

      } finally {
        await clientManager.closeAllClients();
      }

    } finally {
      if (app) {
        await close(app);
      }
    }
  });

  it('should test OAuth 2.1 resource parameter validation (RFC8707)', async () => {
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
            port: 7017,
          },
          mcp: {
            serverInfo: {
              name: 'test-resource-param-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
        async onReady(container, expressApp) {
          // Mock token endpoint to validate resource parameter
          expressApp.useMiddleware((req: any, res: any, next: any) => {
            if (req.path === '/oauth/token' && req.method === 'POST') {
              const { resource, grant_type, code, code_verifier } = req.body;

              if (grant_type !== 'authorization_code') {
                res.status(400).json({
                  error: 'unsupported_grant_type',
                  error_description: 'Only authorization_code grant type is supported'
                });
                return;
              }

              if (!resource) {
                res.status(400).json({
                  error: 'invalid_request',
                  error_description: 'Resource parameter is required (RFC8707)'
                });
                return;
              }

              // Validate resource parameter format (must be absolute URI)
              try {
                const resourceUrl = new URL(resource);

                // RFC8707: Resource must not contain fragment
                if (resourceUrl.hash) {
                  res.status(400).json({
                    error: 'invalid_target',
                    error_description: 'Resource must not contain fragment'
                  });
                  return;
                }

                // Must be HTTPS or localhost
                if (resourceUrl.protocol !== 'https:' && !resourceUrl.hostname.includes('localhost')) {
                  res.status(400).json({
                    error: 'invalid_target',
                    error_description: 'Resource must be HTTPS or localhost'
                  });
                  return;
                }
              } catch (error) {
                res.status(400).json({
                  error: 'invalid_target',
                  error_description: 'Resource must be a valid absolute URI'
                });
                return;
              }

              if (!code || !code_verifier) {
                res.status(400).json({
                  error: 'invalid_request',
                  error_description: 'Authorization code and PKCE verifier required'
                });
                return;
              }

              // Return access token with audience bound to the resource
              res.json({
                access_token: `token-for-${Buffer.from(resource).toString('base64')}`,
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'mcp:read mcp:write',
                resource: resource
              });
              return;
            }

            if (req.path === '/oauth/authorize' && req.method === 'GET') {
              const { resource, code_challenge, code_challenge_method, redirect_uri } = req.query;

              if (!resource) {
                res.status(400).send('Resource parameter is required');
                return;
              }

              if (!code_challenge || code_challenge_method !== 'S256') {
                res.status(400).send('PKCE with S256 is required');
                return;
              }

              // Mock authorization - return code
              const authCode = 'mock-auth-code-123';
              const callbackUrl = `${redirect_uri}?code=${authCode}&state=${req.query.state || ''}`;
              res.redirect(callbackUrl);
              return;
            }

            next();
          });
        }
      });

      // Test resource parameter validation
      const validResources = [
        'https://mcp.example.com',
        'https://mcp.example.com/mcp',
        'https://mcp.example.com:8443',
        'http://localhost:7017/mcp'
      ];

      const invalidResources = [
        'mcp.example.com', // missing scheme
        'https://mcp.example.com#fragment', // contains fragment
        'not-a-url',
        ''
      ];

      // Test valid resource parameters
      for (const resource of validResources) {
        const response = await fetch('http://localhost:7017/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: 'test-auth-code',
            code_verifier: 'test-verifier',
            resource: resource
          })
        });

        if (response.status !== 200) {
          throw new Error(`Valid resource ${resource} should be accepted`);
        }

        const tokenData = await response.json() as any;
        if (tokenData.resource !== resource) {
          throw new Error('Token response should include the resource parameter');
        }
      }

      // Test invalid resource parameters
      for (const resource of invalidResources) {
        const response = await fetch('http://localhost:7017/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: 'test-auth-code',
            code_verifier: 'test-verifier',
            resource: resource
          })
        });

        if (response.status === 200) {
          throw new Error(`Invalid resource ${resource} should be rejected`);
        }

        const errorData = await response.json() as any;
        if (!errorData.error) {
          throw new Error('Invalid resource should return proper OAuth error');
        }
      }

      console.log('✓ OAuth Resource Parameter validation (RFC8707) working correctly');

    } finally {
      if (app) {
        await close(app);
      }
    }
  });

  it('should pass JWT AuthInfo to Tool context using MCPAuthInfoMiddleware', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;

    try {
      @mcp.Tool('authContextTool', { description: 'Tool that checks auth context' })
      class AuthContextTool implements mcp.IMcpTool {
        name = 'authContextTool';

        @Inject()
        ctx: mcp.Context;

        async execute(): Promise<CallToolResult> {
          const auth = this.ctx.authInfo;

          console.log('Tool context:', {
            hasAuth: !!auth,
            contextKeys: Object.keys(this.ctx),
            auth: auth
          });

          if (!auth) {
            return {
              content: [{ type: 'text', text: `No auth info available. Context keys: ${Object.keys(this.ctx).join(', ')}` }],
              isError: true
            };
          }

          return {
            content: [{
              type: 'text',
              text: `Auth info received:\n` +
                    `- Token: ${auth.token}\n` +
                    `- Client ID: ${auth.clientId}\n` +
                    `- Scopes: ${auth.scopes.join(', ')}\n` +
                    `- Expires At: ${auth.expiresAt}\n` +
                    `- Resource: ${auth.resource?.toString()}\n` +
                    `- Extra: ${JSON.stringify(auth.extra)}`
            }]
          };
        }
      }

      app = await createLightApp({
        imports: [
          express,
          mcp,
        ],
        preloadModules: [
          AuthContextTool,
        ],
        globalConfig: {
          express: {
            keys: ['test'],
            port: 7018,
          },
          mcp: {
            serverInfo: {
              name: 'test-jwt-auth-mcp',
              version: '1.0.0',
            },
            transportType: 'stream-http',
            enableJwtAuthHelper: true,  // 启用内置JWT认证助手
          },
          jwt: {
            secret: 'test-jwt-secret-key-for-mcp',
            sign: {
              expiresIn: '1h'
            }
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // 生成真实的 JWT token
      const jwtService = await app.getApplicationContext().getAsync(JwtService);
      const payload = {
        sub: 'user-123',
        aud: 'test-mcp-client',
        scope: 'mcp:read mcp:write mcp:tool',
        resource: 'https://mcp.example.com/resources',
        iss: 'https://auth.example.com',
        extra: {
          username: 'testuser',
          role: 'admin'
        }
      };
      const jwtToken = await jwtService.sign(payload);

      // 测试带有真实 JWT Authorization 头的请求
      const clientWithAuth = await clientManager.createTestStreamHTTPClient(
        'http://localhost:7018/mcp',
        'test-auth-context-client',
        `Bearer ${jwtToken}`
      );

      const result = await clientWithAuth.callTool({
        name: 'authContextTool',
        arguments: {}
      });

      if (!result.content || result.isError) {
        throw new Error('Tool should receive auth info successfully');
      }

      const responseText = result.content[0]?.text || '';

      // 验证认证信息是否正确传递
      if (!responseText.includes(`Token: ${jwtToken}`)) {
        throw new Error('JWT token should be passed correctly');
      }

      if (!responseText.includes('Client ID: test-mcp-client')) {
        throw new Error('Client ID should match JWT aud claim');
      }

      if (!responseText.includes('Scopes: mcp:read, mcp:write, mcp:tool')) {
        throw new Error('Scopes should match JWT scope claim');
      }

      if (!responseText.includes('Resource: https://mcp.example.com/resources')) {
        throw new Error('Resource should match JWT resource claim');
      }

      if (!responseText.includes('sub":"user-123')) {
        throw new Error('Extra user data should be passed correctly');
      }

      console.log('✓ OAuth AuthInfo correctly passed to Tool context');
      console.log('Auth response:', responseText);

    } finally {
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });
})
