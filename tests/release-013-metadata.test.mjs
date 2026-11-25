import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root=new URL('../', import.meta.url);
const readJson=relative=>JSON.parse(readFileSync(new URL(relative,root),'utf8'));
const readText=relative=>readFileSync(new URL(relative,root),'utf8');

test('candidate 0.1.4 has exact consistent npm, Registry, stdio and sidecar version metadata',()=>{
  const pkg=readJson('package.json');
  const lock=readJson('package-lock.json');
  const registry=readJson('server.json');
  const main=readText('src/index.mjs');
  const tools=readText('src/index-tools.mjs');

  assert.equal(pkg.name,'@ramirkoz/project-consulting-mcp');
  assert.equal(pkg.version,'0.1.4');
  assert.equal(lock.name,pkg.name);
  assert.equal(lock.version,pkg.version);
  assert.equal(lock.packages[''].version,pkg.version);
  assert.equal(lock.packages[''].name,pkg.name);
  assert.equal(registry.name,pkg.mcpName);
  assert.equal(registry.version,pkg.version);
  assert.equal(registry.packages.length,1);
  assert.equal(registry.packages[0].registryType,'npm');
  assert.equal(registry.packages[0].identifier,pkg.name);
  assert.equal(registry.packages[0].version,pkg.version);
  assert.equal(registry.packages[0].transport.type,'stdio');

  assert.match(main,/version:'0\.1\.4'/);
  assert.match(tools,/User-Agent':'project-consulting-mcp\/0\.1\.4'/);
  assert.match(main,/registerTool\('index_shortlist_mcp_servers'/);
  assert.match(tools,/request\('\/index-agent\/v1\/agent-structured-shortlist'/);
  assert.match(main,/registerTool\('index_compare_mcp_servers'/);
  assert.match(tools,/request\('\/index-agent\/v1\/agent-exact-compare'/);

  assert.equal(pkg.dependencies['@modelcontextprotocol/server'],'2.4.0');
  assert.equal(pkg.engines.node,'>=20');
  assert.deepEqual(pkg.files,['src','README.md','README.uk.md','server.json','LICENSE']);
});
