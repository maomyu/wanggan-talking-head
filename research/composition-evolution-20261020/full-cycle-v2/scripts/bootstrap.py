"""Recreate the study from the installed formal fixture and archived design plans."""
from pathlib import Path
import argparse,json,shutil,subprocess,os,hashlib
R=Path(__file__).resolve().parents[1];a=argparse.ArgumentParser();a.add_argument('--out',type=Path,required=True);a.add_argument('--style',default='magazine');args=a.parse_args();out=args.out.resolve();assert not out.exists(),'Output must be a new independent directory'
APP=Path(os.environ.get('WG_PLUGIN_ROOT',str(Path.home()/'plugins/wanggan-talking-head')));cat=json.loads((R/'catalogue.json').read_text());rows=cat['styles']if args.style=='all'else[s for s in cat['styles']if args.style in [s['key'],s['id']]];assert rows,'Unknown style'
out.mkdir(parents=True);cat['styles']=rows;(out/'catalogue.json').write_text(json.dumps(cat,ensure_ascii=False,indent=2));shutil.copytree(R/'scripts',out/'scripts');(out/'qa').mkdir();(out/'plans').mkdir();shutil.copyfile(R/'plans/scene-content.json',out/'plans/scene-content.json')
for s in rows:
 p=out/'variants'/s['key'];subprocess.run(['node',str(APP/'scripts/studio.mjs'),'init','--project',str(p),'--example','approved','--style',s['key']],check=True,stdout=subprocess.DEVNULL)
 design=R/'designs'/s['key'];design=design if design.exists()else R/'variants'/s['key']/'plans';assert design.exists(),'Archived design plans missing'
 shutil.copytree(design,p/'plans',dirs_exist_ok=True)
 for name in ['build-project.mjs','director.js']:shutil.copyfile(R/'scripts'/name,p/'scripts'/name)
 versionFile=R/'library/source-versions.json'
 if versionFile.exists():
  version=json.loads(versionFile.read_text())[s['key']];archived=R/'directors'/(version['directorSha256']+'.js');archived=archived if archived.exists()else R/'variants'/s['key']/'assets/director.js';shutil.copyfile(archived,p/'scripts/director.js')
 subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True,stdout=subprocess.DEVNULL)
 subprocess.run([str(APP/'runtime/.venv/bin/python'),str(APP/'runtime/scripts/media.py'),'prepare',str(p)],check=True,stdout=subprocess.DEVNULL)
 project=json.loads((p/'project.json').read_text());project.update(renderer='custom',status='research-planned');(p/'project.json').write_text(json.dumps(project,ensure_ascii=False,indent=2))
 def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
 binding={'htmlSha256':sha(p/'index.html'),'directorSha256':sha(p/'assets/director.js'),'buildSha256':sha(p/'scripts/build-project.mjs'),'protected':{str(x.relative_to(p)):sha(x)for x in [p/'assets/master.mp4',p/'assets/edited-voice.wav',p/'plans/edit-plan.json']}}
 (p/'qa/source-binding.json').write_text(json.dumps(binding,indent=2))
print(str(out))
