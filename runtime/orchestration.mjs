import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const orchestrationAxes=['information','representation','typography','object-motion','camera','transition','rhythm'];
export function orchestrations(){return JSON.parse(fs.readFileSync(path.join(root,'registry/orchestrations.json'),'utf8'));}
export function loadOrchestration(value){
 const row=orchestrations().find(r=>[r.id,r.name,...r.aliases].includes(value));
 if(!row)throw Error('未知编排: '+value+'；使用 orchestrations 查询');return row;
}
export function selectOrchestration(request='',explicit){
 if(explicit==='auto')return {id:'auto',selection:'agent-pending',reason:'代理按本片语义与素材选择，不套固定时间线'};
 if(explicit){const row=loadOrchestration(explicit);return {id:row.id,selection:'explicit',reason:'用户明确选择'};}
 const active=request.split(/[，。；,;\n]/).filter(s=>!/^\s*(保留|沿用|保持|不改|别改|不要|维持)/.test(s)).join('，');
 const found=orchestrations().filter(r=>[r.name,...r.aliases].some(n=>active.includes(n)));
 if(found.length>1)throw Error('检测到多套编排；用 --orchestration 明确本版本选择，分别比较请另建版本');
 return found.length?{id:found[0].id,selection:'request-hint',reason:'由指令提取，代理结合上下文确认'}:null;
}
// Only the symbolic-track contract used by the approved reference cases.
// Other new mechanisms retain their own implementation and validation.
export function checkEventTiming(project){
 const read=n=>JSON.parse(fs.readFileSync(path.join(project,n),'utf8'));
 const motion=read('plans/motion-events.json'),camera=read('plans/camera-plan.json');
 if(read('project.json').timingContract!=='symbolic-events-v1')return {checked:false,reason:'not this event-track contract'};
 const rhythm=read('plans/timing.json'),total=read('timing.json').frameCount;
 const at=v=>typeof v==='string'?rhythm.eventSchedule?.[v]:v;
 const frame=v=>{const n=at(v);if(!Number.isInteger(n)||n<0||n>=total)throw Error('节奏事件缺失或越界: '+v);return n;};
 const tracks=[...Object.entries(motion.tracks||{}),['camera',camera.viewTransforms||[]]];
 for(const[name,points]of tracks){let previous=-1;for(const p of points){const n=frame(p.at);if(n<previous)throw Error('节奏重排使路径倒序: '+name);previous=n;}}
 for(const[name,range]of Object.entries(motion.actions||{}))if(range.length!==2||frame(range[1])<=frame(range[0]))throw Error('动作时间无正向区间: '+name);
 for(const w of rhythm.readWindows||[])if(w.length!==2||!w.every(Number.isInteger)||w[0]<0||w[1]>total||w[1]<=w[0])throw Error('读窗无合法区间');
 return {checked:true,tracks:tracks.length,actions:Object.keys(motion.actions||{}).length,scope:'事件存在、帧界、路径顺序与正向区间；可读性仍需实际检查'};
}
