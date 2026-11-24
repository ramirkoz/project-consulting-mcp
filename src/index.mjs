#!/usr/bin/env node
// Phase A: Index read-only tools and Coster static export guidance.
// No raw files, no analytics, no Full Report, no ResearchBundle mutations.
import {McpServer} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import {searchIndex,indexCapabilities,structuredIndexShortlist,compareIndexServers} from './index-tools.mjs';
import {exportGuide} from './coster-guide.mjs';
import {indexSearchOutputSchema,indexCapabilitiesOutputSchema,costerExportGuideOutputSchema,indexStructuredShortlistOutputSchema,indexExactCompareOutputSchema} from './output-schemas.mjs';
const readonly=(openWorld=false)=>({
  readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:openWorld
});
export function createServer(){
  const server=new McpServer({name:'project-consulting-index',version:'0.1.3'});
  server.registerTool('index_search_mcp_servers',{
    description:'Search dated MCP server metadata in Project Consulting Index. Listings are NOT proof of safety, uptime, or task success.',
    annotations:readonly(true),
    outputSchema:indexSearchOutputSchema,
    inputSchema:z.object({
      query:z.string().min(2).max(56),
      limit:z.number().int().min(1).max(24).default(12),
      offset:z.number().int().min(0).max(70000).default(0)
    })
  },args=>searchIndex(args));
  server.registerTool('index_shortlist_mcp_servers',{
    description:'Filter dated Index publisher metadata by explicit source, status and public HTTPS link requirements, then reuse unchanged Ranking v3. Metadata only: no MCP execution, uptime, safety, or task success verification. Live Index endpoint is independently released; metadata-only, no task execution.',
    annotations:readonly(true),
    outputSchema:indexStructuredShortlistOutputSchema,
    inputSchema:z.strictObject({
      query:z.string().min(2).max(56),
      limit:z.number().int().min(1).max(24).default(12),
      offset:z.number().int().min(0).max(70000).default(0),
      filters:z.strictObject({
        sourceCodes:z.array(z.enum([
          'RONINFORGE_STATE_OF_MCP','MCP_OFFICIAL_REGISTRY','GITHUB_PUBLIC_REPOSITORY'
        ])).max(3).refine(a=>new Set(a).size===a.length).optional(),
        statuses:z.array(z.enum(['active','deprecated','candidate','unknown']))
          .max(4).refine(a=>new Set(a).size===a.length).optional(),
        requireRepositoryUrl:z.boolean().optional(),
        requireEndpointUrl:z.boolean().optional(),
        excludeDeprecated:z.boolean().optional()
      }).optional()
    })
  },args=>structuredIndexShortlist(args));
  server.registerTool('index_compare_mcp_servers',{
    description:'Compare 2–4 exact MCP server names using dated Index publisher metadata. No verified uptime, safety, installation, tool execution or task success.',
    annotations:readonly(true),
    outputSchema:indexExactCompareOutputSchema,
    inputSchema:z.strictObject({
      names:z.array(z.string().regex(/^[A-Za-z0-9][A-Za-z0-9./_:-]{1,159}$/))
        .min(2).max(4).refine(names=>new Set(names).size===names.length)
    })
  },args=>compareIndexServers(args));
  server.registerTool('index_capabilities',{
    description:'Read public Project Consulting Index feature availability, limits and evidence caveats.',
    annotations:readonly(true),
    outputSchema:indexCapabilitiesOutputSchema,
    inputSchema:z.object({})
  },()=>indexCapabilities());
  server.registerTool('coster_export_guide',{
    description:'Get static instructions for obtaining billing and usage exports for a browser-based Coster audit. Does not read local files.',
    annotations:readonly(false),
    outputSchema:costerExportGuideOutputSchema,
    inputSchema:z.object({provider:z.enum(['openai','openrouter','anthropic','gemini']).optional()})
  },({provider})=>exportGuide(provider));
  return server;
}
// SDK v2 serves from a factory. serveStdio returns a handle, not a Promise.
// Never call createServer() here or append .catch() to that handle.
void serveStdio(createServer);
