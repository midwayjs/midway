import { DecoratorManager, MetadataManager, Scope, ScopeEnum } from '@midwayjs/core';

export const MCP_RESOURCE_KEY = 'mcp:resource';
export const MCP_TOOL_KEY = 'mcp:tool';
export const MCP_PROMPT_KEY = 'mcp:prompt';

export function Resource(): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MCP_RESOURCE_KEY, target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function Tool(toolName: string, toolSchema: any): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MCP_TOOL_KEY, target);
    MetadataManager.defineMetadata(target, MCP_TOOL_KEY, {
      toolName,
      toolSchema
    });
    Scope(ScopeEnum.Request)(target);
  };
}

export function Prompt(): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MCP_PROMPT_KEY, target);
    Scope(ScopeEnum.Request)(target);
  };
} 