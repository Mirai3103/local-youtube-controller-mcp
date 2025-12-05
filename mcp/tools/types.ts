import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShape, ZodObject } from 'zod';

// Extract the register tool parameters type from McpServer
type RegisterToolParams = Parameters<McpServer['registerTool']>;

export interface ToolDefinition<
  TInput extends ZodRawShape = ZodRawShape,
  TOutput extends ZodRawShape = ZodRawShape
> {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodObject<TInput>;
  outputSchema?: ZodObject<TOutput>;
  handler: any
}

