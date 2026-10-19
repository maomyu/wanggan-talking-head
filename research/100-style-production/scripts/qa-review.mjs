import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import{createRequire}from'node:module';const{chromium}=createRequire(path.join(process.env.WG_PLUGIN_ROOT||fileURLToPath(new URL('../../../',import.meta.url)),'runtime/package.json'))('playwright');
const R=path.dirname(path.dirname(fileURLToPath(import.meta.url))),base='http://127.0.0.1:52700/',browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(base+'review.html');
 await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode())));
 const cards=await page.locator('[data-play]').evaluateAll(els=>els.map(e=>({...e.dataset}))),playback=[];
 for(const c of cards){
  const range=await page.request.get(base+c.play,{headers:{Range:'bytes=0-127'}});
  if(range.status()!==206||!range.headers()['content-range']?.startsWith('bytes 0-127/'))throw Error('Range delivery '+c.name);
  await page.locator('[data-play]').filter({has:page.locator(`img[alt="${c.name}实际画面"]`)}).click();
  await page.waitForFunction(()=>{const v=document.querySelector('dialog video');return v.videoWidth===1080&&!v.paused&&v.currentTime>.1});
  await page.evaluate(()=>{const v=document.querySelector('dialog video');v.pause();v.currentTime=18.9});
  await page.waitForFunction(()=>{const v=document.querySelector('dialog video');return !v.seeking&&v.readyState>=2&&Math.abs(v.currentTime-18.9)<.02});
  const media=await page.locator('dialog video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration,muted:v.muted,volume:v.volume}));
  if(Math.abs(media.duration-1100/30)>.04||media.muted||media.volume!==1)throw Error('Complete voice-preserved stream '+c.name);
  playback.push({name:c.name,range:206,seek:18.9,...media});await page.locator('#close').click();
 }
 await page.screenshot({path:path.join(R,'qa/production-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 await page.screenshot({path:path.join(R,'qa/production-mobile.png')});
 await page.locator('[data-play]').first().click();const dialogOverflow=await page.locator('dialog').evaluate(e=>e.scrollWidth-e.clientWidth);await page.locator('#close').click();
 if(overflow>1||dialogOverflow>1||errors.length)throw Error(JSON.stringify({overflow,dialogOverflow,errors}));
 await fs.writeFile(path.join(R,'qa/production-review.json'),JSON.stringify({ok:true,playback,mobileOverflow:overflow,dialogOverflow,errors},null,2));
 console.log('Production gallery: '+playback.length+' complete streams, Range seeks, original audio setting and mobile passed');
} finally {await browser.close()}
