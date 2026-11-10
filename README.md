# Project Consulting MCP: Index first

**Published:** [`@ramirkoz/project-consulting-mcp@0.1.0`](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp) and [official MCP Registry `io.github.ramirkoz/project-consulting@0.1.0`](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.0).

Phase A provides three read-only tools. It does not read local AI billing files or create reports.

| Tool | Network | Capability |
| --- | --- | --- |
| index_search_mcp_servers | HTTPS request to pc.zp.ua | Dated Index catalog search, NOT proof of safety or uptime |
| index_capabilities | HTTPS request to pc.zp.ua | Public Index capabilities |
| coster_export_guide | No network | Static instructions for obtaining OpenAI, OpenRouter, Anthropic and Gemini exports |

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
          "args": ["-y", "@ramirkoz/project-consulting-mcp@0.1.0"]
        }
      }
    }

For Claude Code:

    claude mcp add project-consulting -- npx -y @ramirkoz/project-consulting-mcp@0.1.0

The Registry name is io.github.ramirkoz/project-consulting. This package is not a remote MCP endpoint for ChatGPT.

## Safety and privacy

Index records are dated metadata and do not verify successful third-party task execution or whether servers are safe to install.

The Free Audit browser application is available at https://pc.zp.ua/coster/. An optional Full Report requires separate human consent to transfer normalized metrics and contribute an aggregated ResearchBundle. The MCP Phase A tools cannot grant consent or create reports.

## Source, tests and release status

This is the standalone public source repository for Index MCP v0.1.0, licensed under **MIT**. The package is already published on [npm](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp), and the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.ramirkoz%2Fproject-consulting/versions/0.1.0) lists it. For local development on Node.js 20+, run `npm ci` and `npm test`; the committed lockfile pins dependencies. The previously published npm and Registry v0.1.0 metadata may still refer to the original private development repository; this public mirror does **not** retroactively modify either published artifact.

No local billing-file audit tool is included in Phase A. Such a capability would require a separate future release with its own offline-only constraints.
