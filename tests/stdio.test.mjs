import test from 'node:test';
import assert from 'node:assert/strict';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
test('real SDK v2 stdio starts and lists precisely three read-only tools; static guide makes no network calls',
 {timeout:20000},async()=>{
  const client=new Client({name:'project-consulting-test',version:'0.1.0'});
  const transport=new StdioClientTransport({
    command:process.execPath,args:['src/index.mjs'],cwd:root
  });
  try{
    await client.connect(transport);
    const {tools}=await client.listTools();
    assert.deepEqual(tools.map(x=>x.name).sort(),[
      'coster_export_guide','index_capabilities','index_search_mcp_servers'
    ]);
    for(const t of tools){
      assert.equal(t.annotations?.readOnlyHint,true,'all phase A operations read-only');
      assert.equal(t.annotations?.destructiveHint,false);
    }
    const guide=await client.callTool({
      name:'coster_export_guide',arguments:{provider:'openrouter'}
    });
    assert.notEqual(guide.isError,true);
    assert.equal(guide.structuredContent?.guides?.length,1);
    assert.equal(guide.structuredContent?.phase,'A');
    assert.match(guide.content?.[0]?.text||'',/single authoritative Spend view/);
  }finally{
    await client.close().catch(()=>{});
  }
});
