import fs from 'node:fs/promises';import path from 'node:path';import {createRequire}from'node:module';
const R=path.resolve(import.meta.dirname,'..'),{chromium}=createRequire('/Users/maoyu/plugins/wanggan-talking-head/runtime/package.json')('playwright');
const cat=JSON.parse(await fs.readFile(path.join(R,'catalogue.json'))),b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:1080,height:1920}}),rows=[];
await p.goto('http://127.0.0.1:54556/variants/magazine/index.html');await p.waitForFunction(()=>window.ADAPT_READY);
await p.evaluate(async()=>{const v=document.querySelector('video');v.muted=true;await v.play();await new Promise(r=>v.requestVideoFrameCallback(r));v.pause();const shown=new Promise(r=>v.requestVideoFrameCallback(r)),seeked=new Promise(r=>v.addEventListener('seeked',r,{once:true}));v.currentTime=18.9;await Promise.all([shown,seeked])});
await fs.mkdir(path.join(R,'qa/same-art'),{recursive:true});
for(const g of cat.grammars){await p.evaluate(g=>{window.DIRECTOR_CONFIG.choreography=g;window.STUDY_RENDER(18.9)},g);await p.screenshot({path:path.join(R,'qa/same-art',g.key+'.jpg'),type:'jpeg',quality:94});rows.push({key:g.key,name:g.name,time:18.9,state:await p.evaluate(()=>window.STUDY_STATE),path:'qa/same-art/'+g.key+'.jpg'})}
await fs.writeFile(path.join(R,'qa/same-art/proof.json'),JSON.stringify({art:'magazine',sourceFrame:567,onlyVariable:'DIRECTOR_CONFIG.choreography',rows},null,2));await b.close();
