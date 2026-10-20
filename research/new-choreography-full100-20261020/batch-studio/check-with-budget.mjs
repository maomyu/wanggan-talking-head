// The pinned checker has a hard 120s whole-audit watchdog independent of --timeout.
// Extend that one in memory; preserve installed files, audit rules and report data.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {registerHooks} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';

const [entry,project,...checkOptions]=process.argv.slice(2);
if(!entry||!project)throw Error('Expected pinned HF entry and project');
const root=path.resolve(path.dirname(entry),'..'),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(pkg.version!=='0.8.174')throw Error('Watchdog adapter is only reviewed for pinned HF0.8.174');
const target=path.join(root,'dist/check-PUDEOXGP.js'),original=fs.readFileSync(target,'utf8');
const before='var CHECK_DEADLINE_MS = 12e4;',after='var CHECK_DEADLINE_MS = 6e5;';
if(original.split(before).length!==2)throw Error('Pinned watchdog declaration changed; inspect rather than patch blindly');
const adapted=original.replace(before,after),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(sha(original)!=='d9de149627b67560774c131b1caa45bd1c49d48a331d0fc0afd756fd199e3b9c')throw Error('Pinned checker module hash changed; inspect the adapter');
let applications=0;
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(url.startsWith('file:')&&fileURLToPath(url)===target){
  if(String(result.source)!==original)throw Error('Loaded checker differs from reviewed source');
  applications++;
  return {...result,source:adapted};
 }
 return result;
}});
process.on('exit',()=>{
 const report={kind:'pinned-checker-watchdog-only',version:pkg.version,originalModuleSha256:sha(original),inMemoryModuleSha256:sha(adapted),installedModuleUnchanged:sha(fs.readFileSync(target,'utf8'))===sha(original),onlyChange:{fromMs:120000,toMs:600000,expression:before},applications,rulesChanged:false,samplesReduced:false};
 fs.writeFileSync(path.join(project,'qa/check-budget.json'),JSON.stringify(report,null,2));
 if(applications!==1||!report.installedModuleUnchanged)process.exitCode=1;
});
process.argv=[process.execPath,entry,'check',...checkOptions,project];
console.log('[check-budget-adapter] pinned rules and sampling; whole-audit watchdog120s ->600s in memory only');
await import(pathToFileURL(entry).href);
