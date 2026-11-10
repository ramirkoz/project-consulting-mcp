// Phase A: STATIC export guidance only. No file reading, server report, or consent.
const DOCS={
  openai:{
    provider:'openai',dashboard:'https://platform.openai.com/usage',
    instructions:[
      'Open OpenAI Platform > Usage; select the correct organization, project, and date range.',
      'Export Activity data as CSV with Model grouping.',
      'Export Cost data as CSV with Line item grouping for the same period.',
      'Select both unmodified files together in the Coster browser.'
    ],notes:'API platform billing is distinct from ChatGPT subscription invoices.'
  },
  openrouter:{
    provider:'openrouter',dashboard:'https://openrouter.ai/activity',
    instructions:[
      'Open OpenRouter Activity > Explore and select one reporting window.',
      'Group by Model, optionally with Day if a time series is desired.',
      'Export Total usage (Spend), Request count, Prompt tokens, Completion tokens, and optionally Cached tokens as original CSV files.',
      'Use a single authoritative Spend view: do not combine overlapping summary and daily Spend snapshots unless their coverage reconciles.'
    ],notes:'The native Explore exports can include auxiliary request_count columns; do not manually edit CSVs.'
  },
  anthropic:{
    provider:'anthropic',dashboard:'https://console.anthropic.com/',
    instructions:[
      'Open the Claude Console or the official Admin API billing/usage tools.',
      'Export separately supported Costs and Usage data for the same scope/period.',
      'Retain all pagination pages when using Admin API and preserve original JSON/CSV format.',
      'If no cost export is present, usage alone cannot prove billed spending.'
    ],notes:'Supported formats vary; not every console screenshot or export is machine-readable.'
  },
  gemini:{
    provider:'gemini',dashboard:'https://console.cloud.google.com/billing',
    instructions:[
      'Open Google Cloud Billing and select the billing account used for Gemini.',
      'Choose Reports/Cost Table or an official Cloud Billing export with Gemini-related SKUs.',
      'Keep the currency, time period, SKU descriptions, billed cost, net subtotal, discounts and credit columns where available.',
      'Export CSV without manually changing the accounting signs or removing credits.'
    ],notes:'Gross/list costs are not necessarily billed net after promotional credits and discounts.'
  }
};
export const PROVIDERS=Object.freeze(Object.keys(DOCS));
export function exportGuide(provider){
  const keys=provider?[provider]:PROVIDERS;
  const guides=keys.map(k=>DOCS[k]).filter(Boolean);
  if(provider&&!guides.length)
    return {isError:true,structuredContent:{error:'INVALID_PROVIDER'},
      content:[{type:'text',text:'Provider must be openai, openrouter, anthropic, or gemini.'}]};
  const data={phase:'A',guides,freeAuditUrl:'https://pc.zp.ua/coster/',
    notice:'Free Audit runs locally in the browser. Full Report is a separate, explicit consent workflow. The MCP v0.1 package does not read or audit local files.'};
  const text=guides.map(g=>g.provider.toUpperCase()+'\n'+g.instructions.map((s,i)=>
    (i+1)+'. '+s).join('\n')+'\n'+g.dashboard+'\n'+g.notes).join('\n\n');
  return {structuredContent:data,content:[{type:'text',text:text+'\n\n'+data.notice}]};
}
