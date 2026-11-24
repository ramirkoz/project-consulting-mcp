# P1.5f — MCP 0.1.3 exact comparison source candidate (unpublished)

Date: 2026-11-24 (Europe/Kyiv). State: **authored source only**, not published or executed by a real external MCP client.

## Verified product basis

- Owner HostPro production log: `P15E_PREFLIGHT=PASS`, `P15E_SCOPED_PUBLIC_ACCEPTANCE=PASS`, `P15E_RESULT=PRODUCTION_INDEX_AGENT_PASS`. The free non-browser `POST https://pc.zp.ua/index-agent/v1/agent-exact-compare` endpoint was enabled on 2026-11-24; accept the owner's scoped HTTP result without re-running old P15b/c/d/e tests.
- Existing `@ramirkoz/project-consulting-mcp` repo main at baseline `0.1.2` has **four** read-only MCP tools: search, shortlist, capabilities, Coster static export guide. Exact comparison did not have an MCP entrypoint. Actual npm/Official Registry publication state is an independent external fact: do not infer it from repository version or stale README.
- This 0.1.3 source candidate adds **exactly one** `index_compare_mcp_servers` MCP tool, no new backend or live server changes. The four old tool names and HTTP contracts remain unchanged.

## Implemented

- `src/index.mjs`: registers fifth tool with read-only, non-destructive, idempotent annotations and `z.strictObject({names})` for 2–4 unique exact valid MCP names.
- `src/index-tools.mjs`: validates a names-only body under 640 UTF-8 bytes, calls only fixed-origin `POST /index-agent/v1/agent-exact-compare` (no Origin, Authorization, Sec-Fetch, arbitrary hosts or user-provided URL); maps HTTP errors to MCP `isError`. Validates response shape, requested count, found count and input order; produces bounded metadata-only summary. No user billing files, hidden MCP tool execution, import, authentication or payment.
- `src/output-schemas.mjs`: new `indexExactCompareOutputSchema` with explicit source provenance, publisher status, optional dated RoninForge 2026-09-13 historical evidence, found/missing cases and hard `false` for current uptime/task success/installation/security verification. Installs remain `null`; no trust ratings are invented.
- Source candidate version harmonized to **0.1.3** in `package.json`, `package-lock.json`, `server.json`, runtime and request `User-Agent`. This does **not** publish a new version or modify external registry records.
- `tests/exact-compare.test.mjs`: **four new narrow, mocked HTTP tests authored**: input rejects without fetch, fixed-origin POST and typed contract, false security/uptime/order claims rejected, HTTP errors surfaced. Existing `tests/stdio.test.mjs` and release-metadata test adapted for five tools and 0.1.3, not repeated as completed evidence. Documentation updated in EN/UK.

## One targeted validation and approval boundary

Before any release: run **only** the new compare test, one SDK stdio tool-inventory test and package metadata check in a sandboxed Node20+ environment using pinned dependencies; do not use GitHub Actions if quota exhausted and do not claim PASS until observed. After these, an explicit owner authorization is required separately for (1) npm publish of exact 0.1.3 and (2) official MCP Registry update. External MCP trust listings are not a release gate and may crawl at their own pace. Do not accidentally install a version that has not been published.

No HostPro deployment, browser Worker third release, Coster, PG, CRON, ResearchBundle, 124-shard immutable index, Discovery 20k cap, Visa/MPP/x402 payment work. Agent-first, both Index and Coster core free.

**Current state:** `P15E_EXACT_COMPARE_HTTP=LIVE_OWNER_ACCEPTED`; `P15F_MCP_SOURCE_013=READY`; `P15F_TEST_RUN=NOT_CLAIMED`; `P15F_NPM_PUBLISH=NO`; `P15F_OFFICIAL_REGISTRY_UPDATE=NO`.
