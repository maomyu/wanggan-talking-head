from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';C=json.loads((APP/'style-library/catalog.json').read_text());version=C['version'];results=[]
for key in sys.argv[1:]:
 row=next(s for s in C['styles']if s['key']==key);p=R/'portability'/('formal-'+version)/key
 if p.exists():raise SystemExit('Keep existing probe: '+str(p))
 with(R/'qa'/f'{key}-formal-{version}.log').open('w')as log:
  subprocess.run(['node',str(APP/'scripts/studio.mjs'),'init','--project',str(p),'--example','approved','--style',key],check=True,stdout=log,stderr=subprocess.STDOUT)
  subprocess.run(['node',str(APP/'scripts/studio.mjs'),'run','--project',str(p),'--until','build'],check=True,stdout=log,stderr=subprocess.STDOUT)
 layout=json.loads((p/'plans/layout-plan.json').read_text());motion=json.loads((p/'plans/motion-plan.json').read_text());assert layout['portrait']['baseBox']==row['portraitBase']and motion['travelSeconds']==row['personTravelSeconds']==.55
 html=(p/'index.html').read_text();assert 'data-person-travel="0.55"'in html
 results.append(dict(key=key,project=str(p),base=row['portraitBase'],travel=.55,builtWithFormalRuntime=True))
 print(key+' formal init/build passed',flush=True)
(R/'qa'/f'formal-probes-{version}.json').write_text(json.dumps(dict(ok=True,version=version,results=results),ensure_ascii=False,indent=2)+'\n')
