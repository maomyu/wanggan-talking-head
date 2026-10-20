from pathlib import Path
import json,hashlib,urllib.request,concurrent.futures
R=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
cat=json.loads((R/'catalogue.json').read_text());a=json.loads((R/'qa/prototypes.json').read_text());dense=json.loads((R/'qa/dense-dom-audit.json').read_text());by={s['key']:s for s in a};assert len(a)==100 and len(by)==100 and len(dense)==12
issues=[];checks=[];urls=[]
for s in cat['styles']:
 p=R/'variants'/s['key'];n=by[s['key']];b=json.loads((p/'qa/source-binding.json').read_text());assert not n['errors'];assert b['htmlSha256']==n['source']['htmlSha256']==sha(p/'index.html');assert b['directorSha256']==n['source']['directorSha256']==sha(p/'assets/director.js');assert all(sha(p/k)==v for k,v in b['protected'].items())
 for state in n['states']:
  f=state['frame'];urls.append(f'variants/{s["key"]}/qa/stills/f{f}.jpg')
  if not s['fullFilmRepresentative']:
   x=state['actual'];person=x['person'];c=x['caption'];text=x['text'];bad=[]
   if abs(person['w']-person['h'])>.1 or x['radius']!='50%':bad.append('circle')
   if x['filters']:bad.append('person-filter')
   if person['x']<-.1 or person['right']>1080.1 or person['bottom']>1599:bad.append('person-bounds')
   if c['y']!=1600 or c['bottom']>1800.1 or x['font']!='60px' or text['h']>154:bad.append('caption')
   issues.extend({'key':s['key'],'frame':f,'issue':i}for i in bad)
 if s['fullFilmRepresentative']:
  v=json.loads((p/'qa/full-check.json').read_text());assert v['exitCode']==0 and v['result']['ok'] and v['htmlSha256']==sha(p/'index.html') and v['directorSha256']==sha(p/'assets/director.js');checks.append({'key':s['key'],'layoutSamples':v['result']['layout']['samples'],'motionSamples':v['result']['motion']['samples'],'contrastChecked':v['result']['contrast']['checked'],'contrastPassed':v['result']['contrast']['passed']})
for x in dense:
 assert not x['issues'];p=R/'variants'/x['key'];assert x['source']['htmlSha256']==sha(p/'index.html') and x['source']['directorSha256']==sha(p/'assets/director.js')
assert not issues,issues
def head(rel):
 with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:54556/full-cycle-v2/'+rel,method='HEAD'),timeout=20)as response:assert response.status==200 and int(response.headers['Content-Length'])>2000
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:list(pool.map(head,urls))
result={'nativeStyleCount':100,'capturedStillCount':len(urls),'measuredDOMStates':sum(len(x['states'])for x in dense)+sum(len(x['states'])for x in a if not next(s for s in cat['styles']if s['key']==x['key'])['fullFilmRepresentative']),'measuredDOMIssues':issues,'fullFilmChecks':checks,'fullFilmSourceBindings':len(checks),'directorSha256':sha(R/'scripts/director.js'),'compositePixelExact':sum(x['compositePixelExact']for x in a),'compositePixelNotExact':[x['key']for x in a if not x['compositePixelExact']],'limits':'Composite exactness is a separate test from measured geometry. Listed failures remain unpromoted; no full100 MP4 or100x12 acceptance claim. A stationary-video follow-up found zero pixel error for type-poster, without erasing the original false result.','httpStillsPassed':len(urls)}
(R/'qa/native-final.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
