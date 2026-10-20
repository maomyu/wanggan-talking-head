"""Copy only reconstructible research source and compact evidence to a checked-out research branch."""
from pathlib import Path
import json,shutil,hashlib,subprocess
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';dest=APP/'research/composition-evolution-20261020/full-cycle-v2';branch=subprocess.check_output(['git','branch','--show-current'],cwd=APP,text=True).strip();assert branch=='research/composition-evolution-20261020',branch
dest.mkdir(parents=True,exist_ok=True)
for name in ['scripts','library','modules','plans']:
 shutil.copytree(R/name,dest/name,dirs_exist_ok=True,ignore=shutil.ignore_patterns('__pycache__'))
for name in ['catalogue.json','BRIEF.md','STATE.md','review.html','review.css','review.js','编排选择与协作.md','验证记录.md']:
 if(R/name).exists():shutil.copyfile(R/name,dest/name)
versions={};evidence=dest/'evidence';evidence.mkdir(exist_ok=True)
for s in json.loads((R/'catalogue.json').read_text())['styles']:
 p=R/'variants'/s['key'];design=dest/'designs'/s['key'];shutil.copytree(p/'plans',design,dirs_exist_ok=True)
 binding=json.loads((p/'qa/source-binding.json').read_text());versions[s['key']]=binding;(dest/'directors').mkdir(exist_ok=True);shutil.copyfile(p/'assets/director.js',dest/'directors'/(binding['directorSha256']+'.js'))
 case=evidence/s['key'];case.mkdir(exist_ok=True)
 for n in ['source-binding.json','full-check.json','film-verification.json','render-progress.json']:
  if(p/'qa'/n).exists():shutil.copyfile(p/'qa'/n,case/n)
 if(p/'qa/encoded-story.jpg').exists():shutil.copyfile(p/'qa/encoded-story.jpg',case/'encoded-story.jpg')
for n in ['native-final.json','prototypes.json','dense-dom-audit.json','unified-entry-probe.json','final-verification.json','author-review.json','retry-history.json','rebuild-probe.json']:
 if(R/'qa'/n).exists():shutil.copyfile(R/'qa'/n,evidence/n)
if(R/'qa/contact').exists():shutil.copytree(R/'qa/contact',evidence/'contact',dirs_exist_ok=True)
for target in [R/'library/source-versions.json',dest/'library/source-versions.json']:target.write_text(json.dumps(versions,indent=2))
files={str(p.relative_to(dest)):hashlib.sha256(p.read_bytes()).hexdigest()for p in dest.rglob('*')if p.is_file()and p.name!='archive-manifest.json'};assert not any(x.endswith(('.mp4','.wav','.env'))or'/node_modules/'in x for x in files)
(dest/'archive-manifest.json').write_text(json.dumps({'scope':'source, designed plans and compact evidence; no generated projects, media renders, dependencies or secrets','files':files},ensure_ascii=False,indent=2));print(json.dumps({'branch':branch,'files':len(files),'bytes':sum((dest/x).stat().st_size for x in files),'destination':str(dest)},ensure_ascii=False))
