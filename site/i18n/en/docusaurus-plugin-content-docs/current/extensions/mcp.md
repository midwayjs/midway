# MCP (Model Context Protocol)

MCP (Model Context Protocol) is an open standard developed by Anthropic for securely connecting AI models to external data sources and tools. It allows AI applications to semantically integrate with various services, providing AI models with a standardized way to access real-time information, perform actions, and retrieve resources.

![MCP Architecture](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/mcp-simple-diagram.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=37d50a5429a8f662c1beb564b4df8e65)

Midway provides full support and wrapping for MCP, enabling you to quickly create an MCP server. This chapter demonstrates how to provide MCP services within the Midway ecosystem.

Midway currently uses the latest [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk), and offers decorators and framework integration to publish MCP services quickly.

Related information:

**Service offering**

| Description            |      |
| ---------------------- | ---- |
| Available for standard projects | ✅    |
| Available for Serverless        | ❌    |
| Available for integrated apps   | ✅    |
| Contains independent main framework | ✅    |
| Contains independent logs       | ✅    |

**Transport types supported**

| Transport type | Description                                   | Support |
| -------------- | --------------------------------------------- | ------- |
| stdio          | Standard input/output transport for CLI apps  | ✅       |
| stream-http    | HTTP stream transport, the recommended modern approach | ✅       |
| sse            | Server-Sent Events (deprecated, backward compatible) | ✅       |

## Install dependencies

Install MCP dependencies in an existing project.

```bash
$ npm i @midwayjs/mcp@4 --save
$ npm i @modelcontextprotocol/sdk zod --save
```

:::warning
Important Zod compatibility notice

The MCP SDK (`@modelcontextprotocol/sdk`) currently uses Zod v3.x. To ensure compatibility, your project must use Zod 3.x. Do not use Zod v4.x or higher, otherwise type compatibility issues may occur.

Recommended specific version:
```bash
$ npm i zod@^3.24.1 --save
```
:::

If you use the `sse` or `stream-http` transport, you also need to install one of the HTTP framework components (choose one):

```bash
# Express framework
$ npm i @midwayjs/express@4 --save

# Or Koa framework
$ npm i @midwayjs/koa@4 --save

# Or Egg.js framework
$ npm i @midwayjs/web@4 --save
```

Or add the following dependencies to `package.json` and reinstall.

```json
{
  "dependencies": {
    "@midwayjs/mcp": "^4.0.0",
    "@modelcontextprotocol/sdk": "^1.19.0",
    "zod": "^3.24.1",
    "@midwayjs/express": "^4.0.0"
  }
}
```

:::tip
If you use the `sse` or `stream-http` transport, you need to choose and install an HTTP framework:
- `@midwayjs/express` - Express framework
- `@midwayjs/koa` - Koa framework
- `@midwayjs/web` - Egg.js framework

If you only use the `stdio` transport, HTTP framework components are not required.
:::

## Enable component

Import the MCP component in `src/configuration.ts`:

```typescript
import { Configuration } from '@midwayjs/core';
import * as mcp from '@midwayjs/mcp';
// If using sse/stream-http transports, import an HTTP framework
import * as express from '@midwayjs/express';

@Configuration({
  imports: [
    express, // HTTP framework (required for sse/stream-http)
    mcp      // Import MCP component
  ],
  // ...
})
export class MainConfiguration {}
```

:::info
Transport dependency notes:
- `stdio` transport: only import `@midwayjs/mcp`
- `sse` or `stream-http` transports: also import an HTTP framework component (e.g. `@midwayjs/express`)
:::

## Configuration

Configure MCP server information in `config.default.ts`:

```typescript
export default {
  // When using sse/stream-http transports, configure the HTTP framework
  express: {
    port: 3000,
    keys: ['mcp-secret-key']
  },
  // Or if using Koa
  // koa: {
  //   port: 3000,
  //   keys: ['mcp-secret-key']
  // },
  
  mcp: {
    serverInfo: {
      name: 'my-mcp-server',
      version: '1.0.0',
    },
    // Transport type: stdio | stream-http | sse (deprecated)
    transportType: 'stream-http',
    // Optional: customize endpoint paths
    endpoints: {
      streamHttp: '/mcp',     // StreamHTTP endpoint
      sse: '/sse',            // SSE endpoint (backward compatible)
      messages: '/messages'   // Messages endpoint
    }
  }
}
```

:::warning
- When using the `sse` or `stream-http` transports, you must configure the HTTP framework port and keys.
- If you only use the `stdio` transport, HTTP framework configuration is not required.
:::

### Transport types

MCP supports multiple transport types:

- stdio: Suitable for command-line tools and scripts, communicating via standard input/output
- stream-http: Recommended HTTP transport that supports session management and concurrent requests
- sse: Traditional Server-Sent Events transport (deprecated but kept for backward compatibility)

:::tip
We recommend using the `stream-http` transport. It provides better performance and session management while remaining compatible with traditional SSE clients.
:::

### Default endpoint configuration

When using the `sse` or `stream-http` transports, Midway MCP automatically configures the following default endpoints:

| Endpoint type | Default path | Purpose | Supported transports |
|--------------|--------------|---------|----------------------|
| StreamHTTP   | `/mcp`       | Main MCP communication endpoint (recommended) | stream-http |
| SSE          | `/sse`       | Legacy SSE client compatibility endpoint      | sse, stream-http (backward compatible) |
| Messages     | `/messages`  | Message processing endpoint                   | stream-http, sse |

Customize endpoint configuration:

You can customize these endpoint paths via the `endpoints` configuration:

```typescript
export default {
  mcp: {
    serverInfo: {
      name: 'my-mcp-server',
      version: '1.0.0',
    },
    transportType: 'stream-http',
    endpoints: {
      streamHttp: '/api/mcp',        // Custom StreamHTTP endpoint
      sse: '/api/events',            // Custom SSE endpoint
      messages: '/api/messages'      // Custom messages endpoint
    }
  }
}
```

Endpoint access examples:

Assuming the server runs at `http://localhost:3000`, the default endpoints are:

- StreamHTTP client: `http://localhost:3000/mcp`
- SSE client: `http://localhost:3000/sse`
- Messages endpoint: `http://localhost:3000/messages`

:::info
Backward compatibility: When the server is configured with the `stream-http` transport, legacy SSE clients can still connect and communicate via the `/sse` endpoint.
:::

### Logging configuration

The MCP component outputs logs by default. You can further configure logging details via `mcpLogger`.

```typescript
// src/config/config.default.ts
export default {
  midwayLogger: {
    mcpLogger: {
      // ...
    }
  },
}
```

## Usage

### Tools

Create an MCP tool using the `@Tool` decorator:

```typescript
import { Tool, IMcpTool, ToolConfig } from '@midwayjs/mcp';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const weatherConfig: ToolConfig<{ city: z.ZodString }> = {
  description: 'Get weather information for a city',
  inputSchema: {
    city: z.string().describe('The city name')
  }
};

@Tool('get_weather', weatherConfig)
export class WeatherTool implements IMcpTool {
  async execute(args: { city: string }): Promise<CallToolResult> {
    // Simulate fetching weather data
    const weather = await this.getWeatherData(args.city);
    
    return {
      content: [
        {
          type: 'text',
          text: `Weather in ${args.city}: ${weather.temperature}°C, ${weather.condition}`
        }
      ]
    };
  }

  private async getWeatherData(city: string) {
    // Actual weather API call
    return {
      temperature: 22,
      condition: 'Sunny'
    };
  }
}
```

### Prompts

Create an MCP prompt using the `@Prompt` decorator:

```typescript
import { Prompt, IMcpPrompt, PromptConfig } from '@midwayjs/mcp';
import { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const promptConfig: PromptConfig<{ 
  topic: z.ZodString; 
  style: z.ZodOptional<z.ZodString>; 
}> = {
  description: 'Generate content on a specific topic',
  argsSchema: {
    topic: z.string().describe('The topic to write about'),
    style: z.string().optional().describe('Writing style (formal, casual, etc.)')
  }
};

@Prompt('content_generator', promptConfig)
export class ContentPrompt implements IMcpPrompt {
  async generate(args: { topic: string; style?: string }): Promise<GetPromptResult> {
    const style = args.style || 'professional';
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Write a ${style} article about: ${args.topic}`
          }
        }
      ]
    };
  }
}
```

### Resources

Create an MCP resource using the `@Resource` decorator:

```typescript
import { Resource, IMcpResource, ResourceConfig } from '@midwayjs/mcp';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

const resourceConfig: ResourceConfig = {
  description: 'Access user database information',
  uri: 'database://users/{id}',
  mimeType: 'application/json'
};

@Resource('user_data', resourceConfig)
export class UserResource implements IMcpResource {
  async handle(uri: URL): Promise<ReadResourceResult> {
    const userId = this.extractUserIdFromUri(uri);
    const userData = await this.getUserData(userId);
    
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(userData)
        }
      ]
    };
  }

  private extractUserIdFromUri(uri: URL): string {
    const path = uri.pathname;
    return path.split('/').pop() || '';
  }

  private async getUserData(userId: string) {
    // Actual database query
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com'
    };
  }
}
```

## Full example

Here is a complete MCP server example:

```typescript
// src/configuration.ts
import { Configuration } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import * as mcp from '@midwayjs/mcp';

@Configuration({
  imports: [
    express,
    mcp
  ],
  importConfigs: ['./config']
})
export class MainConfiguration {}

// src/config/config.default.ts
export default {
  express: {
    port: 3000,
  },
  mcp: {
    serverInfo: {
      name: 'example-mcp-server',
      version: '1.0.0',
    },
    transportType: 'stream-http',
  }
}

// src/tools/calculator.ts
import { Tool, IMcpTool, ToolConfig } from '@midwayjs/mcp';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const calcConfig: ToolConfig<{ 
  operation: z.ZodEnum<['add', 'subtract', 'multiply', 'divide']>;
  a: z.ZodNumber;
  b: z.ZodNumber;
}> = {
  description: 'Perform basic mathematical operations',
  inputSchema: {
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }
};

@Tool('calculator', calcConfig)
export class CalculatorTool implements IMcpTool {
  async execute(args: { 
    operation: 'add' | 'subtract' | 'multiply' | 'divide';
    a: number;
    b: number;
  }): Promise<CallToolResult> {
    let result: number;
    
    switch (args.operation) {
      case 'add':
        result = args.a + args.b;
        break;
      case 'subtract':
        result = args.a - args.b;
        break;
      case 'multiply':
        result = args.a * args.b;
        break;
      case 'divide':
        if (args.b === 0) {
          throw new Error('Division by zero');
        }
        result = args.a / args.b;
        break;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `${args.a} ${args.operation} ${args.b} = ${result}`
        }
      ]
    };
  }
}
```

## Dynamic API calls

You can dynamically call the underlying MCP server API at runtime to register tools, prompts, and resources:

```typescript
// src/configuration.ts
import { Configuration, Inject } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import * as mcp from '@midwayjs/mcp';
import { MidwayMCPFramework } from '@midwayjs/mcp';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

@Configuration({
  imports: [
    express,
    mcp
  ],
  importConfigs: ['./config']
})
export class MainConfiguration {
  @Inject()
  mcpFramework: MidwayMCPFramework;

  async onReady() {
    const server = this.mcpFramework.getServer();
    
    // Dynamically register a tool
    server.registerTool({
      name: 'dynamic_tool',
      description: 'A dynamically registered tool',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Message to process' }
        },
        required: ['message']
      }
    }, async (args): Promise<CallToolResult> => {
      return {
        content: [{
          type: 'text',
          text: `Dynamic processing: ${args.message}`
        }]
      };
    });
    
    // Dynamically register a prompt
    server.registerPrompt({
      name: 'dynamic_prompt',
      description: 'A dynamically generated prompt',
      argsSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic' }
        },
        required: ['topic']
      }
    }, async (args) => {
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Please write an article about ${args.topic}`
          }
        }]
      };
    });
    
    // Dynamically register a resource
    server.registerResource({
      uri: 'dynamic://config',
      name: 'Dynamic config',
      description: 'A dynamically generated configuration resource',
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
}
```

:::tip
Dynamic registration APIs are suitable for scenarios where MCP features need to be added at runtime based on business logic. Compared with decorator-based registration, dynamic registration provides greater flexibility but requires you to manage registration logic manually.
:::

## Client connections

### StreamHTTP client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Create a client instance
const client = new Client({
  name: 'my-mcp-client',
  version: '1.0.0'
});

// Create a StreamHTTP transport
const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3000/mcp')
);

// Connect to the server
await client.connect(transport);

// List available tools
const { tools } = await client.listTools();
console.log('Available tools:', tools);

// Call a tool
const result = await client.callTool({
  name: 'calculator',
  arguments: {
    operation: 'add',
    a: 5,
    b: 3
  }
});
console.log('Tool result:', result);

// Close the connection when done
await client.close();
```

### SSE client (legacy)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Create a client instance
const client = new Client({
  name: 'my-mcp-client',
  version: '1.0.0'
});

// Create an SSE transport
const transport = new SSEClientTransport(
  new URL('http://localhost:3000/sse')
);

// Connect to the server
await client.connect(transport);

// Use the client...

// Close the connection when done
await client.close();
```

### Stdio client (process communication)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Create a client instance
const client = new Client({
  name: 'my-mcp-client',
  version: '1.0.0'
});

// Create a Stdio transport and start the MCP server process
const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/bootstrap.js'],
  env: {
    NODE_ENV: 'production',
    // Inherit environment variables from the current process
    ...process.env
  },
  // Optional: set working directory
  cwd: '/path/to/mcp/server',
  // Optional: handle stderr output
  stderr: 'inherit' // 'pipe' | 'inherit' | 'ignore'
});

// Connect to the server (will automatically start the child process)
await client.connect(transport);

// Optionally listen to stderr output (when stderr: 'pipe')
if (transport.stderr) {
  transport.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });
}

// List available tools
const { tools } = await client.listTools();
console.log('Available tools:', tools);

// Call a tool
const result = await client.callTool({
  name: 'calculator',
  arguments: {
    operation: 'add',
    a: 5,
    b: 3
  }
});
console.log('Tool result:', result);

// Close the connection when done (will terminate the child process)
await client.close();
```

:::tip
Transport selection suggestions:
- StreamHTTP: Suitable for network services, microservices architectures, and web app integrations
- SSE: Legacy approach, mainly for backward compatibility
- Stdio: Suitable for command-line tools, local scripts, and desktop app integrations (e.g., Claude Desktop, Cursor, and other AI editors)
:::

### Editor integration

Add your MCP server to the configuration files of editors like Cursor/Trae/Claude Desktop:

Example using stdio:

```json
{
  "mcpServers": {
    "my-midway-mcp-server": {
      "command": "node",
      "args": ["dist/bootstrap.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

Example using stream-http:

```json
{
  "mcpServers": {
    "my-midway-mcp-server": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Best practices

### 1. Type safety

Use TypeScript generics to ensure type safety:

```typescript
import { Tool, ToolConfig } from '@midwayjs/mcp';
import { z } from 'zod';

// Define a clear input type
const userSchema = {
  userId: z.string().min(1),
  includeProfile: z.boolean().optional()
} as const;

const userToolConfig: ToolConfig<typeof userSchema> = {
  description: 'Get user information',
  inputSchema: userSchema
};

@Tool('get_user', userToolConfig)
export class UserTool implements IMcpTool {
  // TypeScript will infer the args type automatically
  async execute(args: { userId: string; includeProfile?: boolean }) {
    // Implementation
  }
}
```

### 2. Error handling

Handle errors correctly and return meaningful information:

```typescript
@Tool('risky_operation', config)
export class RiskyTool implements IMcpTool {
  async execute(args: any): Promise<CallToolResult> {
    try {
      const result = await this.performRiskyOperation(args);
      return {
        content: [{ type: 'text', text: result }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: 'text', 
          text: `Error: ${error.message}` 
        }],
        isError: true
      };
    }
  }
}
```

### 3. Resource management

Manage resource connections and cleanup properly:

```typescript
@Resource('database_query', config)
export class DatabaseResource implements IMcpResource {
  @Inject()
  databaseService: DatabaseService;

  async handle(uri: URL): Promise<ReadResourceResult> {
    const connection = await this.databaseService.getConnection();
    
    try {
      const result = await connection.query(this.parseQuery(uri));
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(result)
        }]
      };
    } finally {
      await connection.close();
    }
  }
}
```

## FAQ

### Q: How is MCP different from traditional APIs?

A: MCP is a protocol designed specifically for AI models, offering semantic interface descriptions, type-safe parameter validation, and context-aware interactions. Compared to traditional REST APIs, MCP is better suited for model understanding and usage.

### Q: How do I deploy MCP services in production?

A: We recommend using the `stream-http` transport with a reverse proxy (e.g., Nginx) for load balancing. Ensure proper security measures and monitoring are enabled.

### Q: Can a single application provide multiple transport types at the same time?

A: The current version supports only one transport type per application instance. If you need multiple transport types, consider deploying multiple instances.

### Q: How do I debug MCP services?

A: Use logging, MCP client tools for testing, or the official [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

## Related links

- [MCP Official Docs](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop MCP Configuration](https://docs.anthropic.com/claude/docs/mcp)