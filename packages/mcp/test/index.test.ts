import { createApp, close } from '@midwayjs/mock';
import * as mcp from '../src';
import { CallToolResult, GetPromptResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import * as express from '@midwayjs/express';
import { SSEMCPClientManager } from './sse-client-utils';
import { DefaultConsoleLoggerFactory } from '@midwayjs/core';

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
})
