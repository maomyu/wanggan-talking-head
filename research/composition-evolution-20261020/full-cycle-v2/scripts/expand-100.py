"""Extend the v2 native study; never overwrite the twelve frozen film inputs."""
from pathlib import Path
import json,shutil,subprocess
R=Path(__file__).resolve().parents[1];old=json.loads((R.parent/'catalogue.json').read_text());cat=json.loads((R/'catalogue.json').read_text());content=json.loads((R/'plans/scene-content.json').read_text());present={s['key']for s in cat['styles']};added=[]
for s in old['styles']:
 if s['key']in present:continue
 p=R/'variants'/s['key'];assert not p.exists(),str(p)
 shutil.copytree(R.parent/'variants'/s['key'],p,ignore=shutil.ignore_patterns('outputs','qa','comparison','.hyperframes'))
 for n in ['qa','outputs']:(p/n).mkdir(exist_ok=True)
 cfg={**s,'status':'research-native-v2','sceneContent':content,'directorVersion':'2.0-research','canonicalMaterialSeek':True};cfg.pop('evidence',None);cfg.pop('shortVideo',None)
 (p/'plans/choreography.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
 for module in ['layout','motion','edit']:
  fp=p/'plans'/f'{module}-plan.json';d=json.loads(fp.read_text());d['compositionStudy'].update(revision='v2-native-remap',scope='native study; full MP4 not claimed');fp.write_text(json.dumps(d,ensure_ascii=False,indent=2))
 cat['styles'].append({**{k:cfg[k]for k in ['id','key','name','choreography','directorVersion']},'fullFilmRepresentative':False});added.append(s['key'])
for s in cat['styles']:
 if s['key']in present:s['fullFilmRepresentative']=True
cat['styles'].sort(key=lambda s:int(s['id'][1:]));cat['scope']='100 native v2 mappings; 12 full-length representative films';cat['fullFilmCount']=12
(R/'catalogue.json').write_text(json.dumps(cat,ensure_ascii=False,indent=2));(R/'qa/new-native-keys.json').write_text(json.dumps(added))
if added:subprocess.run([str(Path.home()/'plugins/wanggan-talking-head/runtime/.venv/bin/python'),str(R/'scripts/build-all.py'),*added],check=True)
