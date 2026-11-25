# Project Consulting MCP — agent-native Index

Free, read-only MCP tools for MCP-server discovery and metadata comparison, plus static AI-billing export guidance. Index and Coster remain free.

**Current release: 0.1.4**, published on November 25, 2026 to [npm](https://www.npmjs.com/package/@ramirkoz/project-consulting-mcp/v/0.1.4) and [Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.ramirkoz%2Fproject-consulting). Six read-only tools are available.

## Tools in release 0.1.4

| Tool | Operation | Basis |
| --- | --- | --- |
| `index_search_mcp_servers` | Purpose-based Index search | Existing read-only API |
| `index_shortlist_mcp_servers` | Explicit publisher-metadata filtering | Existing Index Agent API |
| `index_compare_mcp_servers` | **Compare 2–4 exact MCP names side by side** | Live `/index-agent/v1/agent-exact-compare` HTTP API |
| `index_installation_metadata` | Dated publisher package and remote declarations by exact name | Live `/index-agent/v1/agent-installation-metadata` API |
| `index_capabilities` | Get supported Index features | Existing read-only API |
| `coster_export_guide` | Static billing-export instructions | No uploaded-file access |

Example for the **exact comparison tool**:

```json
{"names":["io.github.example/pdf-reader","github:example/pdf-cleaner"]}
```

The tool passes **only** the exact requested names to the fixed HTTPS origin, without browsing, remote MCP tool execution, secrets, file uploads or telemetry. It preserves request order and explicitly marks missing names. Historical RoninForge evidence is dated **2026-09-13**; it is not present-day uptime, task success, installation or security certification. The output rejects claims of those properties and never invents installation commands.

The `index_installation_metadata` tool accepts `{"name":"io.github.ramirkoz/project-consulting"}` and calls `POST https://pc.zp.ua/index-agent/v1/agent-installation-metadata`. It returns dated publisher declarations, not verified installation, security or authentication instructions.

### API and transport limits

MCP uses **local stdio** (Node.js 20+) with the pinned `@modelcontextprotocol/server` SDK v2.4.0. The new tool calls `POST https://pc.zp.ua/index-agent/v1/agent-exact-compare`, checks 2–4 unique strict names and a 640-byte input cap, validates a typed read-only response and returns errors rather than fabricated success. The API is machine-facing and intentionally rejects browser Origin headers. No remote MCP transport is offered by this package.

### Installation and development

Configure a local MCP client using this stdio command:

```bash
npx -y @ramirkoz/project-consulting-mcp@0.1.4
```

Example MCP client configuration (clients may use different configuration formats):

```json
{"mcpServers":{"project-consulting":{"command":"npx","args":["-y","@ramirkoz/project-consulting-mcp@0.1.4"]}}}
```

Release 0.1.4 was built from commit `cfd081de7ef2b2acb1e62ce93e2dba3954533a12`. Four targeted tests and a live MCP call passed on HostPro. Both registries confirmed publication on November 25, 2026. The published archive retains the pre-publication README; these changes are repository documentation only.

Coster Free Audit is free; Full Report is also free but requires explicit ResearchBundle consent in the Coster browser application. MCP cannot grant that consent, audit local billing exports, process ResearchBundles or take payments.

Source notes: [P15f exact comparison candidate](docs/INDEX_NEXT_P15F_EXACT_COMPARE_MCP_013_SOURCE.md).
