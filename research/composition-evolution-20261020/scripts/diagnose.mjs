import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/Users/maoyu/plugins/wanggan-talking-head/runtime/package.json')('playwright');
const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:1080,height:1920}});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:54556/variants/'+(process.argv[2]||'geometric')+'/index.html');
try{await p.waitForFunction(()=>window.ADAPT_READY&&document.querySelector('video')?.readyState>=2,null,{timeout:45000})}catch(e){console.log(e.message)}
console.log(JSON.stringify(await p.evaluate(()=>({ready:window.ADAPT_READY,study:window.STUDY_READY,video:document.querySelector('video')?.readyState,builds:Object.keys(window.__hf?.buildReady||{}),root:!!document.querySelector('#d-world')}))));
console.log(JSON.stringify(errors));await b.close();
