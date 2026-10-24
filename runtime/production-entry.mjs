import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadRecipe,resolve,catalog,axes} from './collaboration.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export function productionCatalog(){return read(path.join(root,'registry/production-catalog.json'));}
export function chooseRecipe(id){const c=productionCatalog(),e=[...c.families,...c.implementedBranches].find(e=>e.id===id||e.aliases.includes(id));if(!e)throw Error('未登记配方：'+id);return e;}
export function recipeIntent(request='',explicit){
 const c=productionCatalog(),entries=[...c.families,...c.implementedBranches],active=request.split(/[，。；,;\n]/).filter(s=>!/^\s*(保留|沿用|保持|不改|别改|不要改|维持)/.test(s)).join('，');
 const found=entries.filter(e=>e.aliases.some(a=>a.length>=2&&active.includes(a)));
 const narrowed=found.filter(e=>!c.implementedBranches.some(b=>found.includes(b)&&b.familyId===e.familyId&&b.id!==e.id));
 if(!explicit&&narrowed.length>1)throw Error('检测到多个画风，请逐个建项目或明确 --recipe');
 const row=explicit?chooseRecipe(explicit):narrowed[0];
 return {recipe:row?{id:row.id,name:row.name,familyId:row.familyId,branchId:row.branchId||null}:null,stage:'intent-hint',note:'关键词只给候选；未指定画风由代理结合当前文案判断。'};
}
export function patchPalette(project,values,guard){
 guard(project);const rev=read(path.join(project,'revision.json'));
 if(!rev.allowedPlanFiles.includes('palette-tokens.json'))throw Error('该版本未选择配色修改');
 const value=read(path.resolve(values)),file=path.join(project,'plans/palette-tokens.json'),before=read(file);
 if(!value.colorRoles||Object.keys(value).some(k=>k!=='colorRoles'))throw Error('补丁仅接受 colorRoles');
 for(const[k,v]of Object.entries(value.colorRoles))if(!(k in before.colorRoles)||!/^#[0-9a-f]{6}$/i.test(v))throw Error('未知颜色角色或非法色值：'+k);
 before.colorRoles={...before.colorRoles,...value.colorRoles};fs.writeFileSync(file,JSON.stringify(before,null,2)+'\n');
 return {ok:true,changed:'plans/palette-tokens.json',scope:guard(project)};
}
export function auditProductionLibrary(){
 const c=productionCatalog(),entries=[...c.families,...c.implementedBranches],results=[];
 if(c.families.length!==19||new Set(c.families.map(e=>e.familyId)).size!==19)throw Error('母画风配方未完整对应');
 for(const e of entries){const recipe=loadRecipe(e.id),resolved=resolve(recipe);if(!resolved.ok)throw Error(resolved.errors.join('; '));
  const proof=read(path.join(root,e.evidence));for(const[rel,h]of Object.entries(proof.preservedImplementation))if(sha(path.join(root,rel))!==h)throw Error('已认可源码或资源变化：'+rel);
  for(const a of axes){const ref=recipe.axisReferences[a.id];if(!ref||path.isAbsolute(ref.skill)||path.isAbsolute(ref.casePlan)||!fs.existsSync(path.join(root,ref.skill))||sha(path.join(root,ref.casePlan))!==ref.sha256)throw Error('专业计划引用不完整：'+e.id+'/'+a.id);}
  results.push({id:e.id,familyId:e.familyId,branchId:e.branchId||null,plans:11,implementationPreserved:true,videoEvidenceSha256:proof.originalVideoSha256});
 }
 return {ok:true,mothers:c.families.length,implementedBranches:c.implementedBranches.length,expertPlans:results.length*11,results,crossScript:'deferred-by-user',scope:'正式配方、相对引用与已认可源码哈希；不代表换文案或任意组合通过'};
}
