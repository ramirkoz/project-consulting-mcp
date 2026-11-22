# Project Consulting MCP: Index first

> **Published, stable:** `@ramirkoz/project-consulting-mcp@0.1.1` is available on npm and `io.github.ramirkoz/project-consulting@0.1.1` is in the official MCP Registry. **This branch is an UNPUBLISHED candidate `0.1.2-next.0`.** Its fourth tool depends on an Index P2.0 HTTP endpoint that is **not deployed**. Do not install this candidate as if it were the published version.

**Published:** [npm `0.1.1`](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp/v/0.1.1) and [official Registry `0.1.1`](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.1).

The published 0.1.1 provides three read-only tools. An additional tool is present only in this unpublished source candidate. It does not read local AI billing files or create reports.

| Tool | Network | Capability |
| --- | --- | --- |
| index_search_mcp_servers | HTTPS request to pc.zp.ua | Dated Index catalog search, NOT proof of safety or uptime |
| index_capabilities | HTTPS request to pc.zp.ua | Public Index capabilities |
| coster_export_guide | No network | Static instructions for obtaining OpenAI, OpenRouter, Anthropic and Gemini exports |

The source-only candidate also adds `index_shortlist_mcp_servers`: an explicitly typed, free publisher-metadata shortlist with source/status/URL metadata filters, applying constraints before the unchanged Index v3 ranking. Until the new Index endpoint is separately deployed and enabled, it returns `STRUCTURED_SHORTLIST_UNAVAILABLE` rather than pretending a successful empty search.

Index search sends only the query, offset and limit. No account credentials, API keys or billing files are sent. All third-party entries are unverified metadata.

## Requirements and development

Node.js 20+, ESM, the MCP TypeScript SDK v2 (@modelcontextprotocol/server) and Zod v4. From the mcp directory on a build/CI environment:

    npm install
    npm test
    node src/index.mjs

The process speaks MCP JSON-RPC via stdio. Stdout is reserved for the protocol and stderr for diagnostics.

## Client installation

Example local stdio client configuration (requires Node.js 20+):

    {
      "mcpServers": {
        "project-consulting": {
          "command": "npx",
          "args": ["-y", "@ramirkoz/project-consulting-mcp@0.1.1"]
        }
      }
    }

For Claude Code:

    claude mcp add project-consulting -- npx -y @ramirkoz/project-consulting-mcp@0.1.1

The Registry name is io.github.ramirkoz/project-consulting. This package is not a remote MCP endpoint for ChatGPT.

## Safety and privacy

Index records are dated metadata and do not verify successful third-party task execution or whether servers are safe to install.

The Free Audit browser application is available at https://pc.zp.ua/coster/. Full Report costs no money but **requires explicit consent to contribute a ResearchBundle**. Without that consent the user receives Free Audit only. The MCP package cannot submit the consent or audit files. The MCP Phase A tools cannot grant consent or create reports.

## Source, tests and release status

This is the standalone public source repository for published Index MCP v0.1.1, licensed under **MIT**. The package is already published on [npm](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp), and the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.0) lists it. For local development on Node.js 20+, run `npm ci` and `npm test`; the committed lockfile pins dependencies. The previously published npm and Registry v0.1.0 metadata may still refer to the original private development repository; this public mirror does **not** retroactively modify either published artifact.

For 0.1.1 source candidates, each successful tool advertises a typed `outputSchema` and returns `structuredContent`. Tool failures keep their existing `isError: true`, `structuredContent: {error, message}` and human-readable text; the pinned MCP SDK must be tested to ensure these errors remain consumable. The public 0.1.1 is immutable and unchanged.\n\nNo local billing-file audit tool is included in Phase A. Such a capability would require a separate future release with its own offline-only constraints.

## Open ranking benchmark and live MCP demo

- [Index ranking v1 vs v3: 54-case public benchmark](benchmarks/index-ranking/README.md), with [judged queries](benchmarks/index-ranking/gold.json), [reproducible runner](benchmarks/index-ranking/reproduce.mjs), and exact ranking source. Historical scores were supplied by Claude; snapshots are not included, and purpose-query retrieval is still weak.
- [Run a real `npx` → stdio MCP search demo](examples/npx-live-demo.mjs). The demo checks that `github` ranks the vendor-owned MCP metadata first, without running third-party tools.

The public 0.1.1 remains unchanged. This candidate is source-only: no npm publish, MCP Registry update, new public HTTP endpoint, or site deploy. The branch's `server.json` deliberately continues to describe the **published** Registry 0.1.1; it is not a publishing manifest for this prerelease.
