from pathlib import Path
import json,shutil,subprocess,datetime
R=Path(__file__).resolve().parents[1]
keys=['origami','felt-applique','embroidery','gongbi','etching','mechanical-cutaway','spatial-pointcloud']
for key in keys:
 p=R/'variants'/key;backup=p/'qa/revisions/person-contract-before';backup.mkdir(parents=True,exist_ok=True)
 for rel in ['assets/scene.js','scripts/build-project.mjs','plans/layout-plan.json','plans/motion-plan.json','qa/build-state.json','qa/delivery.json','outputs/final.mp4']:
  dest=backup/rel
  if not dest.exists():dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p/rel,dest)
 proof=R/'qa'/f'{key}-verification.json'
 if not(backup/'verification.json').exists():shutil.copy2(proof,backup/'verification.json')
 base=json.loads(subprocess.check_output(['node','--input-type=module','-e','import{pathToFileURL}from"node:url";console.log(JSON.stringify((await import(pathToFileURL(process.argv[1]))).LOOK.base));',str(p/'assets/look.js')],text=True))
 layout=json.loads((p/'plans/layout-plan.json').read_text());layout['portrait']['baseBox']=[base['x'],base['y'],base['w'],base['w']]
 motion=json.loads((p/'plans/motion-plan.json').read_text());motion['travelSeconds']=.55
 for file,data in [('layout-plan.json',layout),('motion-plan.json',motion)]:(p/'plans'/file).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 for source,dest in [('scene.js','assets/scene.js'),('build-project.mjs','scripts/build-project.mjs')]:shutil.copy2(R/'shared'/source,p/dest)
 subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True)
 print(key+' migrated explicit .55s person travel / '+str(layout['portrait']['baseBox']),flush=True)
(R/'qa/person-contract-migration.json').write_text(json.dumps(dict(keys=keys,time=datetime.datetime.now().astimezone().isoformat(),scope='Accurate actual LOOK base and .55s travel; effective default pose preserved, notes follow travel; old sources and encode retained per case'),ensure_ascii=False,indent=2))
