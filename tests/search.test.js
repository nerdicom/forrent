import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretQuery, getMatches, defaultFilters } from '../src/search.js';
import { demoListings } from '../src/data.js';
test('interprets bedrooms, city, budget and requested amenities',()=>{
  assert.deepEqual(interpretQuery('2-bedroom in Denver under $2,200 with parking and a dog'),{city:'Denver',maxRent:2200,beds:'2',pets:true,parking:true,laundry:false});
});
test('budget filtering includes mandatory listed fees',()=>{
  const result=getMatches(demoListings,{...defaultFilters,maxRent:1900});
  assert(!result.some(p=>p.name==='The Juniper'));
  assert(result.every(p=>p.rent+p.fees<=1900));
});
test('does not turn a price or negated pet requirement into bedrooms or a pet filter',()=>{
  const f=interpretQuery('under $2k, no pets and no parking');
  assert.equal(f.maxRent,2000);assert.equal(f.beds,'any');assert.equal(f.pets,false);assert.equal(f.parking,false);
});
test('hard requirements never silently relax',()=>{
  assert.equal(getMatches(demoListings,{...defaultFilters,maxRent:500,beds:'2',pets:true}).length,0);
});
test('studio maps to zero bedrooms',()=>{
  const f=interpretQuery('studio in Austin under $1800');
  assert.equal(f.beds,'0');assert(getMatches(demoListings,f).every(p=>p.beds===0&&p.city==='Austin'));
});
