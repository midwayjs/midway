import { createApp, close } from '@midwayjs/mock';
import * as mcp from '../src';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as koa from '@midwayjs/koa';
import { SSEMCPClientManager } from './sse-client-utils';
import { DefaultConsoleLoggerFactory } from '@midwayjs/core';

describe('/test/koa.test.ts', () => {

  it('should test mcp sse transport with koa utility', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server for SSE endpoint
      @mcp.Tool('toolC_koa', { description: 'this is tool C for SSE with Koa' })
      class ToolC implements mcp.IMcpTool {
        name = 'toolC_koa';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'hello sse mcp koa' }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          koa,
          mcp,
        ],
        preloadModules: [
          ToolC,
        ],
        globalConfig: {
          koa: {
            keys: ['test'],
            port: 7012,
          },
          mcp: {
            serverInfo: {
              name: 'test-sse-mcp-koa',
              version: '1.0.0',
            },
            transportType: 'sse',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create SSE MCP client using utility
      const client = await clientManager.createTestClient('http://localhost:7012/sse', 'test-sse-client-koa');

      // List tools
      const { tools } = await client.listTools();
      const toolC = tools.find(tool => tool.name === 'toolC_koa');
      
      if (!toolC) {
        throw new Error('toolC_koa should be available in SSE transport');
      }

      // Call a tool
      const result = await client.callTool({
        name: 'toolC_koa',
        arguments: {}
      });
      
      if (!result.content || result.content[0]?.text !== 'hello sse mcp koa') {
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

  it('should test mcp stream http transport with koa utility', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server for StreamHTTP endpoint
      @mcp.Tool('toolD_koa', { description: 'this is tool D for StreamHTTP with Koa' })
      class ToolD implements mcp.IMcpTool {
        name = 'toolD_koa';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'hello stream http mcp koa' }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          koa,
          mcp,
        ],
        preloadModules: [
          ToolD,
        ],
        globalConfig: {
          koa: {
            keys: ['test'],
            port: 7013,
          },
          mcp: {
            serverInfo: {
              name: 'test-stream-http-mcp-koa',
              version: '1.0.0',
            },
            transportType: 'stream-http',
          }
        },
        loggerFactory: new DefaultConsoleLoggerFactory(),
      });

      // Create StreamHTTP MCP client using utility
      const client = await clientManager.createTestStreamHTTPClient('http://localhost:7013/mcp', 'test-stream-http-client-koa');

      // List tools
      const { tools } = await client.listTools();
      const toolD = tools.find(tool => tool.name === 'toolD_koa');
      
      if (!toolD) {
        throw new Error('toolD_koa should be available in StreamHTTP transport');
      }

      // Call a tool
      const result = await client.callTool({
        name: 'toolD_koa',
        arguments: {}
      });
      
      if (!result.content || result.content[0]?.text !== 'hello stream http mcp koa') {
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

  it('should test stream-http transport backward compatibility with sse client in koa', async () => {
    const clientManager = new SSEMCPClientManager();
    let app: any;
    
    try {
      // Start the app server with stream-http transport type
      @mcp.Tool('toolE_koa', { description: 'this is tool E for backward compatibility test with Koa' })
      class ToolE implements mcp.IMcpTool {
        name = 'toolE_koa';

        async execute(): Promise<CallToolResult> {
          return {
            content: [{ type: 'text', text: 'hello backward compatible mcp koa' }]
          };
        }
      }

      app = await createApp({
        baseDir: null,
        imports: [
          koa,
          mcp,
        ],
        preloadModules: [
          ToolE,
        ],
        globalConfig: {
          koa: {
            keys: ['test'],
            port: 7015,
          },
          mcp: {
            serverInfo: {
              name: 'test-backward-compat-mcp-koa',
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
        const sseClient = await clientManager.createTestClient('http://localhost:7015/sse', 'test-sse-compat-client-koa');
        
        // List tools
        const { tools } = await sseClient.listTools();
        const toolE = tools.find(tool => tool.name === 'toolE_koa');
        
        if (!toolE) {
          throw new Error('toolE_koa should be available via SSE client on stream-http server');
        }

        // Call a tool
        const result = await sseClient.callTool({
          name: 'toolE_koa',
          arguments: {}
        });
        
        if (!result.content || result.content[0]?.text !== 'hello backward compatible mcp koa') {
          throw new Error('SSE client on stream-http server should return expected result');
        }

        console.log('✓ SSE client successfully connected to stream-http server with backward compatibility (Koa)');
      } catch (error) {
        console.log('✗ SSE client failed to connect to stream-http server:', error.message);
        throw error; // Now we expect this to work, so throw the error if it fails
      }

      // Test 2: Verify StreamHTTP client still works
      const streamHttpClient = await clientManager.createTestStreamHTTPClient('http://localhost:7015/mcp', 'test-streamhttp-compat-client-koa');
      
      // List tools
      const { tools } = await streamHttpClient.listTools();
      const toolE = tools.find(tool => tool.name === 'toolE_koa');
      
      if (!toolE) {
        throw new Error('toolE_koa should be available via StreamHTTP client');
      }

      // Call a tool
      const result = await streamHttpClient.callTool({
        name: 'toolE_koa',
        arguments: {}
      });
      
      if (!result.content || result.content[0]?.text !== 'hello backward compatible mcp koa') {
        throw new Error('StreamHTTP client should return expected result');
      }

      console.log('✓ StreamHTTP client successfully connected to stream-http server (Koa)');

    } finally {
      // Ensure cleanup always happens
      await clientManager.closeAllClients();
      if (app) {
        await close(app);
      }
    }
  });
})