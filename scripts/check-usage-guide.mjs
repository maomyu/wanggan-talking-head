#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/production-entry/prompts.json')));
const expected={'typography-only':['typography'],'motion-only':['object-motion'],'transition-only':['transition'],'rhythm-only':['rhythm'],'palette-only':['palette'],'custom-module':['lighting']};
const results=[];
for(const prompt of data.prompts){
 const request=prompt.text.replace('[模块名称]','光影')+'\n\n'+data.shared;
 const route=JSON.parse(execFileSync(process.execPath,[path.join(root,'scripts/studio.mjs'),'route','--request',request],{encoding:'utf8'}));
 if(prompt.id==='arrangement-only'){
  assert.equal(route.collaboration.orchestration.id,'parallel');assert.equal(route.collaboration.axes.length,7);
 }else if(prompt.group==='full'){
  assert.equal(route.scope,'full',prompt.id);
  assert.equal(route.collaboration.scope,'full',prompt.id);
  assert.equal(route.collaboration.axes.length,11,prompt.id);
 }else{
  assert.equal(route.scope,'module',prompt.id);
  assert.deepEqual(route.collaboration.axes,expected[prompt.id],prompt.id);
  assert.equal(route.collaboration.change.freezeDecisions.length,10,prompt.id);
 }
 if(prompt.id==='chosen-style')assert.equal(route.production.recipe.id,'minimal');
 if(prompt.id==='agent-choice')assert.equal(route.production.recipe,null);
 if(prompt.id==='style-and-arrangement'){assert.equal(route.production.recipe.id,'blueprint');assert.equal(route.collaboration.orchestration.id,'diagram');}
 results.push({id:prompt.id,scope:route.collaboration.scope,axes:route.collaboration.axes});
}
console.log(JSON.stringify({ok:true,cases:results,scope:'Real copyable instructions, including shared constraints; routing only, no new video render'},null,2));
