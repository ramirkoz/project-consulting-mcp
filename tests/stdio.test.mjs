import test from 'node:test';
import assert from 'node:assert/strict';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
test('real SDK v2 stdio starts and lists precisely four read-only tools in an unpublished candidate; static guide makes no network calls',
 {timeout:20000},async()=>{
  const client=new Client({name:'project-consulting-test',version:'0.1.2-next.0'});
  const transport=new StdioClientTransport({
    command:process.execPath,args:['src/index.mjs'],cwd:root
  });
  try{
    await client.connect(transport);
    const {tools}=await client.listTools();
    assert.deepEqual(tools.map(x=>x.name).sort(),[
      'coster_export_guide','index_capabilities','index_search_mcp_servers','index_shortlist_mcp_servers'
    ]);
    for(const t of tools){
      assert.equal(t.annotations?.readOnlyHint,true,'all phase A operations read-only');
      assert.equal(t.annotations?.destructiveHint,false);
      assert.equal(t.outputSchema?.type,'object','every tool advertises an object output schema');
      assert.ok(t.outputSchema?.properties,'output fields must be machine-readable');
    }
    const searchTool=tools.find(x=>x.name==='index_search_mcp_servers');
    assert.ok(searchTool.outputSchema.required.includes('taskSuccessVerified'));
    assert.ok(searchTool.outputSchema.required.includes('proof'));
    const shortlistTool=tools.find(x=>x.name==='index_shortlist_mcp_servers');
    assert.ok(shortlistTool);
    assert.ok(shortlistTool.outputSchema.required.includes('proof'));
    assert.ok(shortlistTool.outputSchema.required.includes('selectionScope'));
    assert.ok(shortlistTool.outputSchema.required.includes('taskSuccessVerified'));
    const capabilitiesTool=tools.find(x=>x.name==='index_capabilities');
    assert.ok(capabilitiesTool.outputSchema.required.includes('product'));
    const guideTool=tools.find(x=>x.name==='coster_export_guide');
    assert.ok(guideTool.outputSchema.required.includes('guides'));
    const guide=await client.callTool({
      name:'coster_export_guide',arguments:{provider:'openrouter'}
    });
    assert.notEqual(guide.isError,true);
    assert.equal(guide.structuredContent?.guides?.length,1);
    assert.equal(guide.structuredContent?.phase,'A');
    assert.match(guide.content?.[0]?.text||'',/single authoritative Spend view/);

    // This error passes the SDK min-length schema, then our safe query validation rejects punctuation before any HTTPS call. The real
    // pinned SDK client must receive it as an ordinary isError tool result,
    // not throw due to the newly published success outputSchema.
    const bad=await client.callTool({
      name:'index_search_mcp_servers',arguments:{query:'??'}
    });
    assert.equal(bad.isError,true);
    assert.equal(bad.structuredContent?.error,'INVALID_SEARCH_TERM');
    assert.match(bad.content?.[0]?.text||'',/INVALID_SEARCH_TERM/);
    const invalidShortlist=await client.callTool({
      name:'index_shortlist_mcp_servers',arguments:{query:'??'}
    });
    assert.equal(invalidShortlist.isError,true);
    assert.equal(invalidShortlist.structuredContent?.error,'INVALID_SHORTLIST_INPUT');
    assert.match(invalidShortlist.content?.[0]?.text||'',/INVALID_SHORTLIST_INPUT/);
  }finally{
    await client.close().catch(()=>{});
  }
});
