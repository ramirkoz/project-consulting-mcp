#!/usr/bin/env node
// Phase A: Index read-only tools and Coster static export guidance.
// No raw files, no analytics, no Full Report, no ResearchBundle mutations.
import {McpServer} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import {searchIndex,indexCapabilities} from './index-tools.mjs';
import {exportGuide} from './coster-guide.mjs';
const readonly=(openWorld=false)=>({
  readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:openWorld
});
export function createServer(){
  const server=new McpServer({name:'project-consulting-index',version:'0.1.0'});
  server.registerTool('index_search_mcp_servers',{
    description:'Search dated MCP server metadata in Project Consulting Index. Listings are NOT proof of safety, uptime, or task success.',
    annotations:readonly(true),
    inputSchema:z.object({
      query:z.string().min(2).max(56),
      limit:z.number().int().min(1).max(24).default(12),
      offset:z.number().int().min(0).max(70000).default(0)
    })
  },args=>searchIndex(args));
  server.registerTool('index_capabilities',{
    description:'Read public Project Consulting Index feature availability, limits and evidence caveats.',
    annotations:readonly(true),
    inputSchema:z.object({})
  },()=>indexCapabilities());
  server.registerTool('coster_export_guide',{
    description:'Get static instructions for obtaining billing and usage exports for a browser-based Coster audit. Does not read local files.',
    annotations:readonly(false),
    inputSchema:z.object({provider:z.enum(['openai','openrouter','anthropic','gemini']).optional()})
  },({provider})=>exportGuide(provider));
  return server;
}
// SDK v2 serves from a factory. serveStdio returns a handle, not a Promise.
// Never call createServer() here or append .catch() to that handle.
void serveStdio(createServer);
