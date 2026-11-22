# Index NEXT P2.7 — stable MCP 0.1.2 source-only release candidate

Date: 2026-11-22 (Europe/Kyiv). Status: **UNPUBLISHED DRAFT**; no npm/Official MCP Registry publication authorized.

## Live dependency acceptance

Owner HostPro screenshot confirmed isolated Index Agent `pc.zp.ua/index-agent` P2.6 production activation:
`P26_ENV_CONFIGURED=YES`, `P26_INDEX_RESTART=SUCCESS`,
`P26_INDEX_HEALTH=PASS`, `P26_CENSUS_ENABLED=YES`,
`P26_CAPABILITIES=PASS`, `P26_SHORTLIST_HTTP=200`,
`P26_SHORTLIST=PASS`, `P26_MATCHES=2866`, `P26_RETURNED=2`,
`P26_PROOF=METADATA_ONLY`, `P26_COSTER_HTTP=200`, `P26_RESULT=PASS`.

Known dated RoninForge Census 31,202 rows, 2026-09-13, SHA-256 `e749ce2c81a78ef599c23e9f235b7c1f158c1e442f7d00cdebfb4c9ee99ba793`. Historical publisher metadata only; no live third-party tool execution or task/uptime verification.

## Current and candidate

- Published npm `@ramirkoz/project-consulting-mcp@0.1.1` and Official Registry `io.github.ramirkoz/project-consulting@0.1.1`: THREE read-only tools.
- Base of candidate: previously accepted unpublished MCP P2.2 pinned source `74f55eb57156f477efc7684b7b92dfb536a95e32`, P2.2 MCP new tests 5/5 owner PASS. Draft PR #4 remains unmerged and 0.1.1 public unchanged.
- Candidate branch: `task/index-next-p27-mcp-012-stable-release-candidate`; no merge/publish yet.
- Candidate update: package.json, package-lock.json root/package version, src/index.mjs MCP declared version, src/index-tools.mjs User-Agent, server.json Registry + npm version all `0.1.2`. README EN/UA now truthful about deployed dependency and unpublished package.
- The fourth tool `index_shortlist_mcp_servers` points to `https://pc.zp.ua/index-agent/v1/agent-structured-shortlist` and filters source/status/metadata links, with bounded typed input and metadata-only output. Three older tools and current public 0.1.1 remain unchanged.

## One focused release-preflight, then STOP

On **owner-approved** HostPro SSH isolated private archive of pinned candidate (no Windows/local builds, no public staging, no Actions), run exactly:
1. Assert exact Git HEAD SHA against source and `0.1.2` manifests; Node24, `npm ci --ignore-scripts`.
2. Run **only new** release-metadata contract test plus the already-agreed small MCP shortlist stdio/SDK acceptance if necessary to prove stable package contract (do not rerun old unrelated suites).
3. `npm pack --dry-run --json`, inspect allowlisted package file names, total size, no secrets or private code.
4. No publication, no npm login/OTP/token handling, no Registry auth, no HostPro application change. Capture safe summary markers only.

The single bounded actual live Index API POST has ALREADY passed P2.6. Do not rerun it for old code provenance. For the package, eventual external-MCP-client acceptance is separate from source acceptance.

## Explicit future release decision and ordering

Owner must separately approve:
1. Mark PR ready/merge into public `ramirkoz/project-consulting-mcp` main, ensuring a pinned tested tree and packaging.
2. Publish **npm 0.1.2** with `--access public` after interactive owner account authorization and public package version verification.
3. Publish **Official MCP Registry 0.1.2** using the same `server.json` only **after** npm version exists and verify official GET; avoid changing historical 0.1.1.
No public package can be called released until both remote public reads pass. npm/package publication is an irreversible distribution event and is NOT authorized merely by a passing source test.

## Invariants

No Coster app/PG/backups/ResearchBundle/cron/feedback changes. Index Worker OFF, Discovery cap 20k unchanged. No Agent Merchant, payment, third-party MCP execution, private prompts, billing files, or agent identity claims. Keep free MCP discovery and independent source provenance; do not call metadata-only results task successes.

References: official npm guidance https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/ and official MCP Registry quickstart https://github.com/modelcontextprotocol/registry/blob/main/docs/modelcontextprotocol-io/quickstart.mdx .
