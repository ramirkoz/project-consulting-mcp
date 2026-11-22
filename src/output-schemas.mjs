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

 
// NEXT candidate only: structured shortlists are never verified MCP executions.
// Keep success schema strict on provenance/verification claims; SDK isError
// responses remain outside this success schema.
const sourceCode=z.enum(['RONINFORGE_STATE_OF_MCP','MCP_OFFICIAL_REGISTRY','GITHUB_PUBLIC_REPOSITORY']);
const entryStatus=z.enum(['active','deprecated','candidate','unknown']);
const publicHttps=z.string().url().refine(value=>{
  try{
    const u=new URL(value);
    return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
      !u.search&&!u.hash&&u.hostname.includes('.')&&
      u.hostname!=='localhost'&&!/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname);
  }catch{return false}
});
const codeHostHttps=publicHttps.refine(value=>{
  const host=new URL(value).hostname;
  return ['github.com','gitlab.com','codeberg.org','bitbucket.org'].includes(host);
});
export const indexStructuredShortlistOutputSchema=z.object({
  ok:z.literal(true),
  proof:z.literal('metadata_only'),
  taskSuccessVerified:z.literal(false),
  currentUptimeVerified:z.literal(false),
  independentTaskVerification:z.literal(false),
  paymentRequired:z.literal(false),
  researchContributionRecorded:z.literal(false),
  agentTransport:z.literal('structured_publisher_metadata_only'),
  selectionScope:z.literal('full_local_metadata_before_ranking'),
  rankingVersion:z.literal('index-catalog-ranking-v3-unchanged'),
  totalMatches:z.number().int().nonnegative(),
  eligibleCatalogRows:z.number().int().min(0).max(70000),
  offset:z.number().int().min(0).max(70000),
  limit:z.number().int().min(1).max(24),
  hasMore:z.boolean(),
  nextOffset:z.number().int().nonnegative().nullable(),
  filtersApplied:z.object({
    sourceCodes:z.array(sourceCode).max(3),
    statuses:z.array(entryStatus).max(4),
    requireRepositoryUrl:z.boolean(),
    requireEndpointUrl:z.boolean(),
    excludeDeprecated:z.boolean()
  }),
  items:z.array(z.object({
    name:z.string().min(1).max(160),
    verification:z.enum([
      'PUBLISHER_METADATA_ONLY','REGISTRY_METADATA_ONLY','GITHUB_REPOSITORY_METADATA_ONLY'
    ]),
    sourceCode,
    status:entryStatus,
    title:z.string().max(150).optional(),
    description:z.string().max(550).optional(),
    endpointUrl:publicHttps.nullable().optional(),
    repositoryUrl:codeHostHttps.nullable().optional()
  }).passthrough()).max(24)
}).passthrough();
