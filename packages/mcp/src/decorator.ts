import {
  DecoratorManager,
  MetadataManager,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { ZodRawShape } from 'zod';
import { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

export const MCP_RESOURCE_KEY = 'mcp:resource';
export const MCP_TOOL_KEY = 'mcp:tool';
export const MCP_PROMPT_KEY = 'mcp:prompt';

// 从 MCP SDK 中提取类型
type PromptArgsRawShape = {
  [k: string]:
    | import('zod').ZodType<string, import('zod').ZodTypeDef, string>
    | import('zod').ZodOptional<
        import('zod').ZodType<string, import('zod').ZodTypeDef, string>
      >;
};

// 提取 registerPrompt 的 config 参数类型
export type PromptConfig<Args extends PromptArgsRawShape = any> = {
  title?: string;
  description?: string;
  argsSchema?: Args;
};

// 提取 registerTool 的 config 参数类型
export type ToolConfig<
  InputArgs extends ZodRawShape = any,
  OutputArgs extends ZodRawShape = any
> = {
  title?: string;
  description?: string;
  inputSchema?: InputArgs;
  outputSchema?: OutputArgs;
  annotations?: ToolAnnotations;
  _meta?: Record<string, unknown>;
};

// 提取 ResourceMetadata 类型
export type ResourceConfig = {
  title?: string;
  description?: string;
  uri?: string;
  mimeType?: string;
  template?: ResourceTemplate;
  _meta?: Record<string, unknown>;
};

export function Resource(
  resourceName: string,
  resourceConfig: string | ResourceTemplate | ResourceConfig
): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MCP_RESOURCE_KEY, target);
    MetadataManager.defineMetadata(
      MCP_RESOURCE_KEY,
      {
        resourceName,
        resourceConfig,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}

export function Tool<
  InputArgs extends ZodRawShape = any,
  OutputArgs extends ZodRawShape = any
>(
  toolName: string,
  toolConfig: ToolConfig<InputArgs, OutputArgs>
): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MCP_TOOL_KEY, target);
    MetadataManager.defineMetadata(
      MCP_TOOL_KEY,
      {
        toolName,
        toolSchema: toolConfig,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}

export function Prompt<Args extends PromptArgsRawShape = any>(
  promptName: string,
  promptConfig: PromptConfig<Args>
): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MCP_PROMPT_KEY, target);
    MetadataManager.defineMetadata(
      MCP_PROMPT_KEY,
      {
        promptName,
        promptConfig,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}
