import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const caseRoot=path.dirname(fileURLToPath(import.meta.url));
const plugin=path.resolve(caseRoot,'../..');
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){
  if(!['--project','--source'].includes(args[i])||!args[i+1])throw Error('使用 --project 新目录 --source 已认可原素材');
  options[args[i].slice(2)]=path.resolve(args[i+1]);
}
if(!options.project||!options.source)throw Error('需要 --project 与 --source；仅复现已认可案例');
const expected='426a3d57498351e72b77c396dacb47cb5f911f66c91582885da2026a8bd0bf58';
const actual=crypto.createHash('sha256').update(fs.readFileSync(options.source)).digest('hex');
if(actual!==expected)throw Error('素材与已认可案例不一致；新素材请用正式init并重新设计，不套用本片台词和动作');
execFileSync(process.execPath,[path.join(plugin,'scripts/studio.mjs'),'init','--project',options.project,'--source',options.source,'--style','A01','--mode','full','--request','明确复现已认可的21.3秒连续解释案例'],{stdio:'inherit'});
for(const folder of ['plans','scripts','assets'])fs.cpSync(path.join(caseRoot,folder),path.join(options.project,folder),{recursive:true});
fs.rmSync(path.join(options.project,'设计交接.md'));
const provenanceFile=path.join(options.project,'assets/asset-provenance.json');
const provenance=JSON.parse(fs.readFileSync(provenanceFile,'utf8'));
provenance['master.mp4'].adoptedFrom='user-supplied source verified by SHA256';
fs.writeFileSync(provenanceFile,JSON.stringify(provenance,null,2)+'\n');
console.log(JSON.stringify({project:options.project,scope:'explicit bounded reproduction',next:'使用正式run重新构建检查与渲染；不继承旧通过报告'}));
