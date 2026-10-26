import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
export function combinations(){return read('registry/combinations.json');}
export function loadCombination(value){
 const row=combinations().find(r=>[r.id,r.code,r.name,...r.aliases].includes(value));
 if(!row)throw Error('未知组合: '+value+'；使用 combinations 查询');
 return row;
}
export function combinationOptions(o){
 if(!o.combination)return o;
 const row=loadCombination(o.combination);
 const recipe=read('recipes/index.json').recipes.find(r=>[r.id,r.name,...(r.aliases||[])].includes(o.recipe));
 const mechanism=read('registry/orchestrations.json').find(r=>[r.id,r.name,...r.aliases].includes(o.orchestration));
 if(o.recipe&&recipe?.id!==row.recipe)throw Error('组合与 --recipe 冲突；请单独选择配方与编排');
 if(o.orchestration&&mechanism?.id!==row.mechanism)throw Error('组合与 --orchestration 冲突；自由选择请不指定组合');
 if(o.style||o.example||o.composition||o.system)throw Error('组合入口不能混用旧模板入口');
 return {...o,combination:row.id,recipe:row.recipe,orchestration:row.mechanism};
}
export function checkCombinationLibrary(){
 const rows=combinations(),axes=read('registry/axes.json'),families=read('registry/families.json'),mechanisms=read('registry/orchestrations.json');
 const ids=rows.flatMap(r=>[r.id,r.code,r.name]);
 if(new Set(ids).size!==ids.length)throw Error('组合编号或名称重复');
 for(const r of rows){
  if(r.kind!=='approved-combination'||!families.some(f=>f.id===r.familyId)||!mechanisms.some(m=>m.id===r.mechanism&&m.kind==='mechanism'))throw Error('组合身份错误: '+r.id);
  const example=read(r.reference.path+'/recipe.json');
  if(example.id!==r.recipe||example.hierarchy.familyId!==r.familyId)throw Error('组合配方不一致: '+r.id);
  const proof=read(r.evidence);
  if(proof.status!=='user-approved'||proof.videoSha256!==r.reference.videoSha256||proof.sourceSha256!==r.reference.sourceSha256)throw Error('组合认可绑定错误: '+r.id);
  for(const a of axes){const rel=r.reference.path+'/plans/'+a.artifact,ref=example.axisReferences[a.id];if(ref.casePlan!==rel||!fs.existsSync(path.join(root,rel)))throw Error('缺少本组合实际计划: '+r.id+'/'+a.id);}
  for(const [rel,expected] of Object.entries(proof.preservedImplementation)){
   const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');
   if(actual!==expected)throw Error('已认可组合实现变化: '+rel);
  }
 }
 return {approvedCombinations:rows.length,plans:rows.length*axes.length,scope:'三组同源认可实现；不增加母画风或编排计数，不代表所有组合或跨文案均已验证'};
}
