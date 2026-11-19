// MCP v0.1.1 output contracts for three READ-ONLY tools.
// Enforce stable core fields while allowing new additive fields from Index API.
// Tool errors use MCP isError=true; the SDK is expected to skip success-schema
// validation for errors. Tests MUST exercise real 2.4.0 stdio client behavior.
import * as z from 'zod/v4';

export const indexSearchOutputSchema=z.object({
  ok:z.literal(true),
  proof:z.literal('metadata_only'),
  taskSuccessVerified:z.literal(false),
  totalMatches:z.number().int().nonnegative(),
  items:z.array(z.object({
    name:z.string().min(1).max(160),
    title:z.string().max(150).optional(),
    description:z.string().max(550).optional(),
    version:z.string().max(60).optional(),
    matchField:z.enum(['name','title','description','multiple']).optional(),
    verification:z.enum([
      'PUBLISHER_METADATA_ONLY',
      'REGISTRY_METADATA_ONLY',
      'GITHUB_REPOSITORY_METADATA_ONLY'
    ]).optional()
  }).passthrough()).max(24)
}).passthrough();

export const indexCapabilitiesOutputSchema=z.object({
  ok:z.literal(true),
  product:z.literal('Project Consulting Index')
}).passthrough();

const provider=z.enum(['openai','openrouter','anthropic','gemini']);
export const costerExportGuideOutputSchema=z.object({
  phase:z.literal('A'),
  guides:z.array(z.object({
    provider,
    dashboard:z.string().url(),
    instructions:z.array(z.string().min(1)).min(1),
    notes:z.string()
  })).min(1).max(4),
  freeAuditUrl:z.literal('https://pc.zp.ua/coster/'),
  notice:z.string().min(1)
}).passthrough();
