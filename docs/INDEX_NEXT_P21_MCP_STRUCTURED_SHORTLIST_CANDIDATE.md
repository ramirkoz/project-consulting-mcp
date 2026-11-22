# Index NEXT P2.1: MCP structured shortlist adapter (unpublished source)

**Date:** 2026-11-22. **Release state:** private development branch of the **public source repository**, no merge, npm publication, official MCP Registry publication, HostPro deployment, or API activation.

## Baselines and dependency

- **Already public and immutable:** `@ramirkoz/project-consulting-mcp@0.1.1`, official Registry `io.github.ramirkoz/project-consulting@0.1.1`, three read-only tools.
- **Backend implemented and verified source-only:** private `ramirkoz/AI-Cost-Auditor` branch `task/index-next-p20-structured-agent-shortlist`, pinned `84a0439aa3807088c1533c9c357331c51c28c394`; owner HostPro Node24 screenshot `tests 5 / pass 5 / fail 0`, `P20_SOURCE_ONLY_TEST_GATE=PASS`, `P20_NO_DEPLOY_NO_PAYMENT_NO_CRON_CHANGE=YES`.
- **Backend remains NOT DEPLOYED:** `POST https://pc.zp.ua/api/v1/index/agent-structured-shortlist` is private source only; `PC_INDEX_AGENT_STRUCTURED_SHORTLIST_ENABLED` defaults OFF. Its existing purpose-search/census readiness gate is independent.
- **This unmerged source branch:** `task/index-next-p21-structured-shortlist-mcp-candidate`, package version `0.1.2-next.0`. It is an internal version marker, NOT a released npm version. `server.json` intentionally continues to describe already published version 0.1.1 and **must not** be used to publish the prerelease.

## Fourth candidate tool

`index_shortlist_mcp_servers` is a **read-only, free, typed** MCP stdio tool. It calls a **fixed** same-origin public Index backend URL without credentials, browser headers, filesystem data, user billing reports or dynamic hosts.

Input (MCP `query` translates to backend `search`):
```json
{
  "query": "pdf",
  "filters": {
    "sourceCodes": ["MCP_OFFICIAL_REGISTRY"],
    "statuses": ["active"],
    "requireRepositoryUrl": true,
    "requireEndpointUrl": false,
    "excludeDeprecated": true
  },
  "limit": 12,
  "offset": 0
}
```

The tool manually and through Zod rejects extra root/facet fields, Unicode query over 56 characters, unsupported/duplicate source/status enums, invalid pagination, type errors or contradictory deprecated requests **before any network call**. It POSTs only this fixed bounded body. A 503 from the not-yet-enabled backend returns MCP `isError:true` with code `STRUCTURED_SHORTLIST_UNAVAILABLE`, **not** a fake empty successful search.

Successful `structuredContent` requires exact Index contract: `proof:"metadata_only"`, `taskSuccessVerified:false`, `currentUptimeVerified:false`, `independentTaskVerification:false`, `paymentRequired:false`, `researchContributionRecorded:false`, `agentTransport:"structured_publisher_metadata_only"`, `rankingVersion:"index-catalog-ranking-v3-unchanged"`, `selectionScope:"full_local_metadata_before_ranking"`, typed `filtersApplied`, bounded `items` and `totalMatches`. Any mismatch in echoed filters/pagination or positive success claims fails closed with `INVALID_INDEX_RESPONSE`. An honest zero-match filtered result is a valid success.

**Trust caveat:** Registry metadata source is NOT evidence of first-party ownership, safe installation, uptime, verified tool execution or actual task success. Public HTTPS endpoint/repository presence is only syntax-checked publisher metadata.

## What was changed

- `src/index-tools.mjs`: typed request validation, fixed API client and explicit disabled/invalid handling.
- `src/output-schemas.mjs`: fourth Zod success-output schema; MCP tool errors keep `isError` contract.
- `src/index.mjs`: fourth read-only registered tool (in unpublished candidate only).
- `tests/structured-shortlist.test.mjs`: five focused synthetic unit tests, no external API.
- `tests/stdio.test.mjs`: official SDK v2 stdio discovery of four tools and on-wire invalid argument error.
- `package.json` and `package-lock.json`: mutually consistent `0.1.2-next.0` marker; dependency versions unchanged.
- `README.md`, `README.uk.md`: clear source/release distinction.
- `server.json` remains unchanged at published Registry 0.1.1.

## Quality gate and release constraints

**New MCP candidate tests NOT YET RUN.** One focused source test is appropriate after code completion; do not republish npm, consume external paid API, send real files to test, run dozens of exploratory SSH commands or use GitHub Actions quota. The maintained `npm test` includes tests and SDK stdio test, requiring previously pinned npm dependencies. A source test pass **is not** permission to release.

Future independent release sequence, each requiring owner approval: (1) Index backend P2 HTTP release/feature enable with truthful status and rollback; (2) typed MCP SDK integration test against expected API response and new package build; (3) separately approve stable version bump, npm publication and official MCP Registry metadata. Until those happen, existing public MCP 0.1.1 remains the only endorsed installable package.

**No changes** to Coster, ResearchBundle, paid datasets, wallets, Index Worker OFF, Discovery cap 20,000, Index production Ranking v3, PG/cron, or legacy feedback API.
