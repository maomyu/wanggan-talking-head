from pathlib import Path
import concurrent.futures,json,shutil,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
catalog=json.loads((R/'catalogue.json').read_text());wanted=set(sys.argv[1:]);rows=[s for s in catalog['styles']if not wanted or s['key']in wanted]
def cli(args,log):
 # The CLI's build is synchronous; explicitly end this isolated invocation
 # after its promise microtasks and exit code have settled. Does not change
 # plugin code or terminate any renderer belonging to another task.
 wrapper='process.argv=[process.execPath,process.env.WG_ENTRY,...JSON.parse(process.env.WG_ARGS)];await import(process.env.WG_ENTRY);await new Promise(r=>setImmediate(r));process.exit(process.exitCode||0);'
 import os
 env={**os.environ,'WG_ENTRY':str(APP/'scripts/studio.mjs'),'WG_ARGS':json.dumps(args)}
 subprocess.run(['node','--input-type=module','-e',wrapper],env=env,stdout=log,stderr=subprocess.STDOUT,check=True)
def job(s):
 p=R/'variants'/s['key'];(R/'qa').mkdir(exist_ok=True)
 if (p/'qa/build-state.json').exists()and(p/'assets/director.js').exists()and(p/'assets/director.js').read_bytes()==(R/'scripts/director.js').read_bytes():
  print(s['id']+' '+s['key']+' already current',flush=True);return s['key']
 with (R/'qa'/f'{s["key"]}-build.log').open('w')as log:
  if not p.exists():cli(['init','--project',str(p),'--example','approved','--style',s['key']],log)
  pr=json.loads((p/'project.json').read_text());pr.update(renderer='custom',status='research-design');(p/'project.json').write_text(json.dumps(pr,ensure_ascii=False,indent=2))
  (p/'plans/choreography.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
  for name in ('director.js','build-project.mjs'):shutil.copyfile(R/'scripts'/name,p/'scripts'/name)
  for module in ('layout','motion','edit'):
   fp=p/'plans'/f'{module}-plan.json';d=json.loads(fp.read_text());d['compositionStudy']={'system':s['choreography']['id'],'key':s['choreography']['key'],'intent':s['choreography']['intent'],'spatial':s['choreography']['states'],'motion':s['choreography']['motion'],'visualEditing':s['choreography']['editing'],'sourceTimingUnchanged':True};fp.write_text(json.dumps(d,ensure_ascii=False,indent=2))
  cli(['run','--project',str(p),'--until','build'],log)
 print(s['id']+' '+s['key']+' '+s['choreography']['id']+' built',flush=True)
 return s['key']
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(job,rows))
