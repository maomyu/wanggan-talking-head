import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const R=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [version,key]=process.argv.slice(2);
if(!version||!key)throw Error('Pass the installed version and a real implemented style');
const install=JSON.parse(await fs.readFile(path.join(R,`qa/install-${version}.json`)));
const installed=install.installedPath;
const manifest=JSON.parse(await fs.readFile(path.join(installed,'.codex-plugin/plugin.json')));
if(manifest.version!==version)throw Error('Wrong installed package');
const {chromium}=createRequire(path.join(installed,'runtime/package.json'))('playwright');
const browser=await chromium.launch({headless:true});
const records=[];
try{
 for(const rel of [`variants/${key}`,`portability/installed-${version}-${key}`]){
  const page=await browser.newPage({viewport:{width:1080,height:1920}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`http://127.0.0.1:52700/${rel}/index.html`);
  await page.waitForFunction(()=>window.STUDY_READY);
  await page.evaluate(()=>STUDY_RENDER(18.9));
  const art=await page.screenshot({clip:{x:64,y:535,width:952,height:700}});
  const words=await page.evaluate(()=>({title:document.querySelector('#title').innerText,caption:document.querySelector('#caption-text').innerText}));
  if(errors.length)throw Error(errors.join('; '));
  records.push({project:rel,artSha256:crypto.createHash('sha256').update(art).digest('hex'),...words});
  await page.close();
 }
 if(records[0].artSha256!==records[1].artSha256||records[0].title!==records[1].title||records[0].caption!==records[1].caption)throw Error('Installed cached entry differs from the verified reference');
 const report={ok:true,version,key,installedPath:installed,records,scope:'已安装缓存真实入口独立init/build；18.9秒解释区PNG和标题/字幕精确匹配，无资源/脚本错误。未重复缓存整片编码；正式源整片复现在独立证据中。'};
 await fs.writeFile(path.join(R,`qa/installed-native-${version}.json`),JSON.stringify(report,null,2)+'\n');
 console.log(`Installed ${version} ${key} native frame matches the verified reference`);
}finally{await browser.close()}
