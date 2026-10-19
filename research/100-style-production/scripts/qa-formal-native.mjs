import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const R=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const APP=process.env.WG_PLUGIN_ROOT||fileURLToPath(new URL('../../../',import.meta.url));
const {chromium}=createRequire(path.join(APP,'runtime/package.json'))('playwright');
const version=process.argv[2];
const probes=JSON.parse(await fs.readFile(path.join(R,`qa/formal-probes-${version}.json`)));
const browser=await chromium.launch({headless:true});
const records=[];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
try{
 for(const {key}of probes.results){
  const pairs=[];
  for(const relative of [`variants/${key}`,`portability/formal-${version}/${key}`]){
   const page=await browser.newPage({viewport:{width:1080,height:1920}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
   await page.goto(`http://127.0.0.1:52700/${relative}/index.html`);
   await page.waitForFunction(()=>window.STUDY_READY);
   const frames=[];
   for(const time of [18.9,24.4,29.3]){
    await page.evaluate(t=>STUDY_RENDER(t),time);
    const pixels=await page.screenshot({clip:{x:64,y:535,width:952,height:700}});
    const words=await page.evaluate(()=>({title:document.querySelector('#title').innerText,caption:document.querySelector('#caption-text').innerText,frame:STUDY_STATE.frame}));
    frames.push({time,artSha256:hash(pixels),...words});
   }
   if(errors.length)throw Error(`${key}: ${errors.join('; ')}`);
   pairs.push(frames);await page.close();
  }
  if(JSON.stringify(pairs[0])!==JSON.stringify(pairs[1]))throw Error('Formal native scene differs: '+key);
  records.push({key,matchedNativeArtPixels:true,frames:pairs[0]});
  console.log(key+' formal native scenes match original at three semantic states');
 }
 await fs.writeFile(path.join(R,`qa/formal-native-${version}.json`),JSON.stringify({ok:true,version,records,scope:'独立正式init/build工程真实浏览；三种语义状态解释区PNG精确一致，标题与字幕同帧，无资源/脚本错误。该项不代替完整MP4复现。'},null,2));
}finally{await browser.close()}
