# Project Consulting MCP — agent-native Index

Free, read-only MCP tools for MCP-server discovery and metadata comparison, plus static AI-billing export guidance. Index and Coster remain free.

**Repository baseline:** `0.1.2` had four read-only tools. **This branch:** a **source-only 0.1.3 candidate** adding the fifth tool `index_compare_mcp_servers`. No npm release or official MCP Registry update has been performed as part of P1.5f. Check those external registries to confirm the current published version; this repository document is not proof of publication.

## Tools in the 0.1.3 source candidate

| Tool | Operation | Basis |
| --- | --- | --- |
| `index_search_mcp_servers` | Purpose-based Index search | Existing read-only API |
| `index_shortlist_mcp_servers` | Explicit publisher-metadata filtering | Existing Index Agent API |
| `index_compare_mcp_servers` | **Compare 2–4 exact MCP names side by side** | Live `/index-agent/v1/agent-exact-compare` HTTP API |
| `index_capabilities` | Get supported Index features | Existing read-only API |
| `coster_export_guide` | Static billing-export instructions | No uploaded-file access |

Example for the **new, unpublished MCP tool**:

```json
{"names":["io.github.example/pdf-reader","github:example/pdf-cleaner"]}
```

The tool passes **only** the exact requested names to the fixed HTTPS origin, without browsing, remote MCP tool execution, secrets, file uploads or telemetry. It preserves request order and explicitly marks missing names. Historical RoninForge evidence is dated **2026-09-13**; it is not present-day uptime, task success, installation or security certification. The output rejects claims of those properties and never invents installation commands.

### API and transport limits

MCP uses **local stdio** (Node.js 20+) with the pinned `@modelcontextprotocol/server` SDK v2.4.0. The new tool calls `POST https://pc.zp.ua/index-agent/v1/agent-exact-compare`, checks 2–4 unique strict names and a 640-byte input cap, validates a typed read-only response and returns errors rather than fabricated success. The API is machine-facing and intentionally rejects browser Origin headers. No remote MCP transport is offered by this package.

### Source review and publication boundary

```bash
npm ci --ignore-scripts
node --test tests/exact-compare.test.mjs
node --test tests/stdio.test.mjs
npm pack --dry-run
```

These commands are for a controlled **future validation**, not claims of completed P1.5f execution. Before publishing `0.1.3`, confirm current npm and Registry versions, verify package/lock/server.json/runtime consistency and obtain explicit owner approval. Publishing to npm and updating the official MCP Registry are separate authorized actions. Do not replace current installation settings with `@ramirkoz/project-consulting-mcp@0.1.3` until those actions are confirmed.

Coster Free Audit is free; Full Report is also free but requires explicit ResearchBundle consent in the Coster browser application. MCP cannot grant that consent, audit local billing exports, process ResearchBundles or take payments.

Source notes: [P15f exact comparison candidate](docs/INDEX_NEXT_P15F_EXACT_COMPARE_MCP_013_SOURCE.md).
