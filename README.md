# Project Consulting MCP: Index first

**Published today:** `@ramirkoz/project-consulting-mcp@0.1.1` on [npm](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp/v/0.1.1) and `io.github.ramirkoz/project-consulting@0.1.1` in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.1), with **three** read-only tools.

**This source branch:** a **NOT YET PUBLISHED** stable `0.1.2` release candidate. It adds a fourth tool, `index_shortlist_mcp_servers`, that calls the independently deployed `https://pc.zp.ua/index-agent/v1/agent-structured-shortlist`. The owner verified the Index Agent live HTTP API on 2026-11-22: health/capabilities HTTP 200 and one real synthetic metadata-only shortlist POST HTTP 200 (2 of 2,866 matches for the query `search`). **This is not proof that the unpublished MCP 0.1.2 package is installed, publicly available, or independently exercised by an external MCP client.**

## Tools

| MCP tool | Endpoint or operation | Status |
| --- | --- | --- |
| `index_search_mcp_servers` | Existing Index purpose search on `pc.zp.ua/api` | Published 0.1.1 |
| `index_capabilities` | Existing Index capabilities on `pc.zp.ua/api` | Published 0.1.1 |
| `coster_export_guide` | Static instructions for exporting OpenAI/OpenRouter/Anthropic/Gemini billing data | Published 0.1.1 |
| `index_shortlist_mcp_servers` | Free, filtered, typed metadata shortlist via `pc.zp.ua/index-agent` | Candidate 0.1.2 only |

The new fourth tool applies strict source, status and public HTTPS URL constraints **before** the unchanged Ranking v3. It rejects unrecognized filters, unexpected fields and contradictions, and treats unavailable/disabled responses as errors rather than fake empty search results.

Example input to the *future fourth tool*:

```json
{
  "query": "search",
  "limit": 2,
  "offset": 0,
  "filters": {
    "sourceCodes": ["RONINFORGE_STATE_OF_MCP"],
    "excludeDeprecated": true
  }
}
```

Records are **publisher metadata**, not proof of verified third-party task execution, uptime, safety, publisher identity, or permission to run/install third-party code. The authenticated base snapshot is dated **2026-09-13**, so do not interpret base records as current liveness tests. The package does not read billing files, execute remote MCP tools, acquire user credentials, take payments, or contribute ResearchBundles.

## Install the actual published release

Requires Node.js 20+ and a local MCP stdio client:

```json
{
  "mcpServers": {
    "project-consulting": {
      "command": "npx",
      "args": ["-y", "@ramirkoz/project-consulting-mcp@0.1.1"]
    }
  }
}
```

For Claude Code:

```bash
claude mcp add project-consulting -- npx -y @ramirkoz/project-consulting-mcp@0.1.1
```

Installing any MCP npm package executes third-party code on the client's machine. Review the source and requested permissions; don't pass secrets into untrusted tools. Do **not** replace 0.1.1 in the example with 0.1.2 until an independently confirmed npm and Registry release.

## Source development and release gate

```bash
npm ci --ignore-scripts
npm test
npm pack --dry-run
```

The release candidate uses the MCP TypeScript SDK 2.4.0 and Zod 4. It retains read-only stdio transport; it is **not** a remote MCP endpoint for ChatGPT.

A release requires a separately approved, pinned source and one focused package/SDK acceptance, followed by **owner-authorized npm publication first** and an **owner-authorized official MCP Registry record second**. npm/Registry currently remain at 0.1.1. Only publish the exact version that matches `package.json`, `package-lock.json`, server runtime version and `server.json`.

The browser-based [Coster Free Audit](https://pc.zp.ua/coster/) is free. Full Report also costs no money but requires the user's explicit ResearchBundle research consent; the MCP package cannot grant that consent or transmit the user's billing files.

This project is under the MIT license. Source and technical release notes: [docs/INDEX_NEXT_P27_STABLE_012_RELEASE_CANDIDATE.md](docs/INDEX_NEXT_P27_STABLE_012_RELEASE_CANDIDATE.md).
