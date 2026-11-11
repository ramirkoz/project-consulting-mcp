# Public Index ranking benchmark · 11 November 2026

This is a **reproducible evaluation method**, not a claim that MCP servers were executed, safe, or live. Both rankings use the same public metadata and the same judged query set.

## Historical evaluation supplied by Claude

The reference evaluation was prepared on **2026-11-11** using the public Project Consulting Index corpus, reportedly **46,809** merged catalog records. Reference answers for vendor queries were checked against the official MCP Registry by vendor name and repository ownership. These reference labels are *research judgments*, not official Registry certifications. The exact historical combined JSON snapshot was **not included** in the handoff, so exact byte-for-byte replication of historical scores is not currently possible.

There are **54** checks, not 43:

| Partition | Checks | v1 | v3 |
| --- | ---: | ---: | ---: |
| Tuned vendor name / publisher queries, top-5 success | 17 | 13/17 | **16/17** |
| Formerly held-out vendor queries, top-5 success | 20 | 18/20 | **20/20** |
| Tuned purpose queries, top-5 success | 6 | 1/6 | 1/6 |
| Formerly held-out purpose queries, top-5 success | 6 | 0/6 | 0/6 |
| Rule-judged topical precision@5 (mean) | 5 | 0.64 | **0.84** |

Additional metric: tuned vendor-query MRR@72 improved from **0.521** to **0.913**. These numbers come from Claude's offline benchmark artifacts supplied to the project owner. They are not measured on a freshly archived 2026-11-11 dataset in this repository.

**Caution:** "held-out" refers only to the original v3 tuning exercise. Those 20 vendor and six purpose queries are now public and **must not be reused as an untouched holdout** for future algorithm releases. Freeze a fresh blind set before evaluating v4.

## What is actually measured

- Vendor / former holdout: whether at least one manually identified vendor server appears in the top 5; MRR measured over top 72.
- Purpose / former holdout: top-5 retrieval of one of the provided reference servers, which is **not** a full measure of semantic intent quality.
- Five rule judgments: heuristic topical precision@5 based on published descriptions and exclusion regexes, **not** independent human safety assessment.
- The five successful live API checks on production after v3 deployment (github, stripe, playwright, redis, postgres) are a **separate smoke test**, not an exhaustive rerun of the 54-case suite.

The v3 score is lexical/vendor-first. Purpose-query performance remains weak. We do **not** claim semantic search or an MCP reliability/security score.

## Reproduce on the current public catalog

Requirements: **Node.js 20+** and outbound HTTPS to `pc.zp.ua`.

From this public repository root:

```bash
node benchmarks/index-ranking/reproduce.mjs
```

The script downloads exactly two public, already-sanitized catalog JSON resources:

- `https://pc.zp.ua/data/mcp-registry-census.json`
- `https://pc.zp.ua/data/index-discovery-overlay.json`

It merges these with the same bounded public catalog merge implementation and evaluates both versions without any API search calls. No files, accounts, keys, MCP tool executions or server probes are needed. The script prints JSON with each partition's result, source dates and catalog size.

To evaluate an independently archived snapshot of **both** public files rather than a changing catalog, save their bytes elsewhere and use:

```bash
node benchmarks/index-ranking/reproduce.mjs --base /path/to/mcp-registry-census.json --overlay /path/to/index-discovery-overlay.json
```

`--details` adds per-query rankings. Never treat two runs over different catalog revisions as a controlled A/B test.

## Source / provenance

- `gold.json`: Claude-provided reference labels and regexes collected 2026-11-11. Names and external records are published for reproducible search evaluation only.
- `search-v1.mjs`: original Index scoring algorithm, pinned from private implementation before v3.
- `search-v3.mjs`: source-identical browser scorer from the production-verified v3 change, merged in private source PR #117.
- `merge.mjs`: canonical public-catalog merge logic. The dated base census attributes upstream RoninForge State of MCP, CC BY 4.0; the live overlay includes official Registry and GitHub repository **metadata only**.
- Reproducible code is published under this repository's MIT license; it does not grant a new license to third-party datasets.

## Live MCP demonstration

The separate demo in `examples/npx-live-demo.mjs` starts the **published npm 0.1.0** package via `npx`, performs a real stdio MCP initialize, lists its three read-only tools, and calls `index_search_mcp_servers` for `github`. It checks that the response remains `metadata_only`.

```bash
node examples/npx-live-demo.mjs
```

This demo performs **one public Index API query** and no third-party MCP execution. An `npx` installation can populate the local npm cache. It is not a test of the safety, uptime, or execution of servers listed in search results.

**Product policy:** ranking is not paid placement; evidence has a dated source; unverified status stays unverified.
