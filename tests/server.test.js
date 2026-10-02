import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV='test';
delete process.env.OPENAI_API_KEY;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_PUBLISHABLE_KEY;
const {server,validateInterpretation}=await import('../server/index.js');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
test.after(()=>new Promise(resolve=>server.close(resolve)));
test('configuration exposes only public connection values and preview status',async()=>{
  const r=await fetch(base+'/api/config');assert.equal(r.status,200);assert.deepEqual(Object.keys(await r.json()).sort(),['ai','demo','supabaseKey','supabaseUrl']);
});
test('search API validates input and applies deterministic fallback without an AI key',async()=>{
  const invalid=await fetch(base+'/api/search',{method:'POST',body:JSON.stringify({query:123})});assert.equal(invalid.status,400);
  const valid=await fetch(base+'/api/search',{method:'POST',body:JSON.stringify({query:'two bedrooms under $2200 with a dog',city:'Bozeman'})});const result=await valid.json();assert.equal(result.mode,'basic');assert.equal(result.filters.maxRent,2200);assert.equal(result.filters.pets,true);assert.equal(result.filters.beds,'2');
});
test('AI output rejects malformed filters and impossible budgets',()=>{
  assert.throws(()=>validateInterpretation({city:'Bozeman',maxRent:-50,beds:'2',pets:true,parking:false,laundry:false,note:''}));
  assert.throws(()=>validateInterpretation({city:'Bozeman',maxRent:2000,beds:'2',pets:'yes',parking:false,laundry:false,note:''}));
});
test('server rejects cross-origin requests and does not expose source files',async()=>{
  assert.equal((await fetch(base+'/api/search',{method:'POST',headers:{Origin:'https://example.invalid'},body:JSON.stringify({query:'studio'})})).status,403);
  assert.equal((await fetch(base+'/server/index.js')).status,404);
});
