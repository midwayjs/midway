# MCP (Model Context Protocol)

MCP (Model Context Protocol) 是由 Anthropic 开发的开放标准协议，用于将 AI 模型与外部数据源和工具安全连接。它允许 AI 应用程序与各种服务进行语义集成，为 AI 模型提供了获取实时信息、执行操作和访问资源的标准化方式。

![MCP Architecture](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/mcp-simple-diagram.png?w=1650&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=37d50a5429a8f662c1beb564b4df8e65)

Midway 提供了对 MCP 的完整支持和封装，能够简单快速地创建 MCP 服务器。本章节演示了如何在 Midway 体系下，提供 MCP 服务的方法。

Midway 当前采用了最新的 [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) 进行开发，并提供了装饰器和框架集成，用于快速发布 MCP 服务。

相关信息：

**提供服务**

| 描述              |      |
| ----------------- | ---- |
| 可用于标准项目    | ✅    |
| 可用于 Serverless | ❌    |
| 可用于一体化      | ✅    |
| 包含独立主框架    | ✅    |
| 包含独立日志      | ✅    |

**传输类型支持**

| 传输类型      | 描述                                    | 支持状态 |
| ------------- | --------------------------------------- | -------- |
| stdio         | 标准输入输出传输，适用于 CLI 应用       | ✅        |
| stream-http   | HTTP 流传输，推荐的现代传输方式         | ✅        |
| sse           | 服务器发送事件传输（已弃用，向下兼容）  | ✅        |

## 安装依赖

在现有项目中安装 MCP 的依赖。

```bash
$ npm i @midwayjs/mcp@4 --save
$ npm i @modelcontextprotocol/sdk zod --save
```

如果使用 `sse` 或 `stream-http` 传输类型，还需要安装 HTTP 框架组件（选择其中一个）：

```bash
# Express 框架
$ npm i @midwayjs/express@4 --save

# 或者 Koa 框架  
$ npm i @midwayjs/koa@4 --save

# 或者 Egg.js 框架
$ npm i @midwayjs/web@4 --save
```

或者在 `package.json` 中增加如下依赖后，重新安装。

```json
{
  "dependencies": {
    "@midwayjs/mcp": "^4.0.0",
    "@modelcontextprotocol/sdk": "^1.19.0",
    "zod": "^3.24.0",
    "@midwayjs/express": "^4.0.0"
  }
}
```

:::tip
如果使用 `sse` 或 `stream-http` 传输类型，您需要选择并安装一个 HTTP 框架：
- `@midwayjs/express` - Express 框架
- `@midwayjs/koa` - Koa 框架  
- `@midwayjs/web` - Egg.js 框架

如果只使用 `stdio` 传输类型，则不需要安装 HTTP 框架组件。
:::

## 开启组件

在 `src/configuration.ts` 中导入 MCP 组件：

```typescript
import { Configuration } from '@midwayjs/core';
import * as mcp from '@midwayjs/mcp';
// 如果使用 sse/stream-http 传输类型，需要导入 HTTP 框架
import * as express from '@midwayjs/express';

@Configuration({
  imports: [
    express, // HTTP 框架（sse/stream-http 传输类型需要）
    mcp      // 导入 MCP 组件
  ],
  // ...
})
export class MainConfiguration {}
```

:::info
**传输类型依赖说明**：
- `stdio` 传输：只需要导入 `@midwayjs/mcp`
- `sse` 或 `stream-http` 传输：需要同时导入 HTTP 框架组件（如 `@midwayjs/express`）
:::

## 配置

在 `config.default.ts` 中配置 MCP 服务器信息：

```typescript
export default {
  // 如果使用 sse/stream-http 传输类型，需要配置 HTTP 框架
  express: {
    port: 3000,
    keys: ['mcp-secret-key']
  },
  // 或者如果使用 Koa
  // koa: {
  //   port: 3000,
  //   keys: ['mcp-secret-key']
  // },
  
  mcp: {
    serverInfo: {
      name: 'my-mcp-server',
      version: '1.0.0',
    },
    // 传输类型：stdio | stream-http | sse(已弃用)
    transportType: 'stream-http',
    // 可选：自定义端点路径
    endpoints: {
      streamHttp: '/mcp',     // StreamHTTP 端点
      sse: '/sse',            // SSE 端点（向下兼容）
      messages: '/messages'   // 消息端点
    }
  }
}
```

:::warning
- 当使用 `sse` 或 `stream-http` 传输类型时，**必须配置 HTTP 框架的端口和密钥**：
- 如果只使用 `stdio` 传输类型，则不需要 HTTP 框架配置
:::

### 传输类型说明

MCP 支持多种传输类型：

- **stdio**: 适用于命令行工具和脚本，通过标准输入输出通信
- **stream-http**: 推荐的 HTTP 传输方式，支持会话管理和并发请求
- **sse**: 传统的服务器发送事件传输（已弃用，但保持向下兼容）

:::tip
推荐使用 `stream-http` 传输类型，它提供了更好的性能和会话管理能力，同时兼容传统的 SSE 客户端。
:::

### 默认端点配置

当使用 `sse` 或 `stream-http` 传输类型时，Midway MCP 框架会自动配置以下默认端点：

| 端点类型 | 默认路径 | 用途 | 支持的传输类型 |
|---------|---------|------|----------------|
| StreamHTTP | `/mcp` | 主要的 MCP 通信端点，推荐使用 | stream-http |
| SSE | `/sse` | 传统 SSE 客户端兼容端点 | sse, stream-http (向下兼容) |
| Messages | `/messages` | 消息处理端点 | stream-http, sse |

**自定义端点配置**

您可以通过 `endpoints` 配置项自定义这些端点路径：

```typescript
export default {
  mcp: {
    serverInfo: {
      name: 'my-mcp-server',
      version: '1.0.0',
    },
    transportType: 'stream-http',
    endpoints: {
      streamHttp: '/api/mcp',        // 自定义 StreamHTTP 端点
      sse: '/api/events',            // 自定义 SSE 端点
      messages: '/api/messages'      // 自定义消息端点
    }
  }
}
```

**端点访问示例**

假设服务器运行在 `http://localhost:3000`，默认端点访问地址为：

- StreamHTTP 客户端：`http://localhost:3000/mcp`
- SSE 客户端：`http://localhost:3000/sse`
- 消息端点：`http://localhost:3000/messages`

:::info
**向下兼容说明**：当服务器配置为 `stream-http` 传输类型时，传统的 SSE 客户端仍然可以通过 `/sse` 端点正常连接和通信。
:::

## 使用方式

### 工具（Tools）

使用 `@Tool` 装饰器创建 MCP 工具：

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
    // 模拟获取天气数据
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
    // 实际的天气 API 调用
    return {
      temperature: 22,
      condition: 'Sunny'
    };
  }
}
```

### 提示（Prompts）

使用 `@Prompt` 装饰器创建 MCP 提示：

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

### 资源（Resources）

使用 `@Resource` 装饰器创建 MCP 资源：

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
    // 实际的数据库查询
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com'
    };
  }
}
```

## 完整示例

这里是一个完整的 MCP 服务器示例：

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

## 动态调用 API

您可以在运行时动态调用 MCP 服务器的原始 API 来注册工具、提示和资源：

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
    
    // 动态注册工具
    server.registerTool({
      name: 'dynamic_tool',
      description: '动态注册的工具',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', description: '要处理的消息' }
        },
        required: ['message']
      }
    }, async (args): Promise<CallToolResult> => {
      return {
        content: [{
          type: 'text',
          text: `动态处理: ${args.message}`
        }]
      };
    });
    
    // 动态注册提示
    server.registerPrompt({
      name: 'dynamic_prompt',
      description: '动态生成的提示',
      argsSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: '主题' }
        },
        required: ['topic']
      }
    }, async (args) => {
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `请写一篇关于 ${args.topic} 的文章`
          }
        }]
      };
    });
    
    // 动态注册资源
    server.registerResource({
      uri: 'dynamic://config',
      name: '动态配置',
      description: '动态生成的配置资源',
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
动态注册的 API 适用于需要在运行时根据业务逻辑动态添加 MCP 功能的场景。与装饰器方式相比，动态注册提供了更大的灵活性，但需要手动管理注册逻辑。
:::

## 客户端连接

### StreamHTTP 客户端

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// 创建客户端实例
const client = new Client({
  name: 'my-mcp-client',
  version: '1.0.0'
});

// 创建 StreamHTTP 传输
const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3000/mcp')
);

// 连接到服务器
await client.connect(transport);

// 列出可用工具
const { tools } = await client.listTools();
console.log('Available tools:', tools);

// 调用工具
const result = await client.callTool({
  name: 'calculator',
  arguments: {
    operation: 'add',
    a: 5,
    b: 3
  }
});
console.log('Tool result:', result);

// 使用完毕后关闭连接
await client.close();
```

### SSE 客户端 (传统方式)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// 创建客户端实例
const client = new Client({
  name: 'my-mcp-client',
  version: '1.0.0'
});

// 创建 SSE 传输
const transport = new SSEClientTransport(
  new URL('http://localhost:3000/sse')
);

// 连接到服务器
await client.connect(transport);

// 使用客户端...

// 使用完毕后关闭连接
await client.close();
```

### Stdio 客户端 (进程通信)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// 创建客户端实例
const client = new Client({
  name: 'my-mcp-client',
  version: '1.0.0'
});

// 创建 Stdio 传输，启动 MCP 服务器进程
const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/bootstrap.js'],
  env: {
    NODE_ENV: 'production',
    // 继承当前进程的环境变量
    ...process.env
  },
  // 可选：设置工作目录
  cwd: '/path/to/mcp/server',
  // 可选：处理 stderr 输出
  stderr: 'inherit' // 'pipe' | 'inherit' | 'ignore'
});

// 连接到服务器（会自动启动子进程）
await client.connect(transport);

// 可选：监听 stderr 输出（当 stderr: 'pipe' 时）
if (transport.stderr) {
  transport.stderr.on('data', (data) => {
    console.error('Server stderr:', data.toString());
  });
}

// 列出可用工具
const { tools } = await client.listTools();
console.log('Available tools:', tools);

// 调用工具
const result = await client.callTool({
  name: 'calculator',
  arguments: {
    operation: 'add',
    a: 5,
    b: 3
  }
});
console.log('Tool result:', result);

// 使用完毕后关闭连接（会终止子进程）
await client.close();
```

:::tip
**传输类型选择建议**：
- **StreamHTTP**: 适用于网络服务、微服务架构、Web 应用集成
- **SSE**: 传统方式，主要用于向下兼容
- **Stdio**: 适用于命令行工具、本地脚本、桌面应用集成（如 Claude Desktop、Cursor 等 AI 编辑器）
:::

### 与编辑器集成

在 Cursor/Trae/Claude Desktop 等编辑器的配置文件中添加您的 MCP 服务器：

stdio 示例如下：

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

stream-http 示例如下：

```json
{
  "mcpServers": {
    "my-midway-mcp-server": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## 最佳实践

### 1. 类型安全

使用 TypeScript 泛型确保类型安全：

```typescript
import { Tool, ToolConfig } from '@midwayjs/mcp';
import { z } from 'zod';

// 定义清晰的输入类型
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
  // TypeScript 会自动推断 args 的类型
  async execute(args: { userId: string; includeProfile?: boolean }) {
    // 实现逻辑
  }
}
```

### 2. 错误处理

正确处理错误并返回有意义的错误信息：

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

### 3. 资源管理

合理管理资源连接和清理：

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

## 常见问题

### Q: MCP 与传统 API 有什么区别？

A: MCP 是专门为 AI 模型设计的协议，提供了语义化的接口描述、类型安全的参数验证和上下文感知的交互。与传统 REST API 相比，MCP 更适合 AI 模型理解和使用。

### Q: 如何在生产环境中部署 MCP 服务？

A: 推荐使用 `stream-http` 传输类型，配合反向代理（如 Nginx）进行负载均衡。确保启用适当的安全措施和监控。

### Q: 可以在一个应用中同时提供多种传输类型吗？

A: 当前版本每个应用实例只支持一种传输类型。如需支持多种传输类型，建议部署多个应用实例。

### Q: 如何调试 MCP 服务？

A: 使用日志记录、MCP 客户端工具进行测试，或者使用官方提供的 [MCP Inspector](https://github.com/modelcontextprotocol/inspector)

## 相关链接

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop MCP 配置](https://docs.anthropic.com/claude/docs/mcp)