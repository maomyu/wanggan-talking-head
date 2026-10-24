from pathlib import Path
import json,hashlib,re,sys,wave
from fontTools.ttLib import TTFont
R=Path(sys.argv[1]);read=lambda p:json.loads(p.read_text());L=read(R/'plans/layout-plan.json');S=read(R/'plans/semantic-plan.json');T=read(R/'timing.json')
title=''.join(str(x[1])for x in S.get('headlines',[]));labels=''.join(c.get('text','')for c in L.get('labelCues',[]));caps=''.join(c['text']for c in T['captions'])
html=(R/'index.html').read_text();body=re.sub(r'<script[^>]*>.*?</script>|<style[^>]*>.*?</style>','',html,flags=re.S);body=re.sub('<[^>]*>','',body)
project=read(R/'project.json');css=(R/'scripts/film.css').read_text()if(R/'scripts/film.css').exists()else''
display_labels=''.join(c.get('text','')for c in L.get('labelCues',[])if c.get('kind')!='note')if('.'+project.get('recipeId','')+' .label{font-family:FilmTitle')in css else''
usage={}
for role,name,text in [('title',L['fontRoles']['title'],title+display_labels),('body',L['fontRoles'].get('body','NotoSansSC-500.woff'),body+labels),('caption',L['fontRoles'].get('caption','NotoSansSC-700.woff'),caps+labels)]:
 usage[name]=usage.get(name,'')+text
reports=[]
for name,text in usage.items():
 f=R/'assets/fonts'/name;cmap=TTFont(f).getBestCmap();missing=sorted({c for c in text if not c.isspace()and ord(c)not in cmap});assert not missing,(name,missing)
 reports.append({'font':name,'characters':len(set(text)),'missing':missing,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(R/'qa/font-coverage.json').write_text(json.dumps({'ok':True,'scope':'actual declared title/body/caption roles and dynamic text; unused bundled fonts not assigned text','fonts':reports},ensure_ascii=False,indent=2))
(R/'font-usage.json').write_text(json.dumps({'fonts':usage,'scope':'declared current title/body/caption roles including scene labels and static body'},ensure_ascii=False,indent=2))
print('checked declared font roles',len(reports))
