from pathlib import Path
import json,subprocess,hashlib,concurrent.futures,sys,time
R=Path(__file__).resolve().parents[1];HF=Path.home()/'plugins/wanggan-talking-head/runtime/node_modules/hyperframes/bin/hyperframes.mjs';keys=sys.argv[1:];rows=json.loads((R/'catalogue.json').read_text())['styles']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def render(s):
 p=R/'variants'/s['key'];check=json.loads((p/'qa/full-check.json').read_text());assert check['result']['ok']and check['exitCode']==0
 before={'htmlSha256':sha(p/'index.html'),'directorSha256':sha(p/'assets/director.js'),'motionAssertionsSha256':sha(p/'index.motion.json')};assert all(check[k]==v for k,v in before.items())
 target=p/'outputs/final.mp4';assert not target.exists(),'Existing video must be kept; use a separate revision for a changed film'
 started=time.time();(p/'qa/render-progress.json').write_text(json.dumps({'status':'rendering','started':started,'binding':before}))
 with(p/'qa/full-render.log').open('w')as log:run=subprocess.run(['node',str(HF),'render',str(p),'--output',str(target),'--fps','30','--quality','delivery','--workers','3','--video-frame-format','png'],stdout=log,stderr=subprocess.STDOUT)
 assert run.returncode==0 and target.exists(),s['key']+' render failed'
 assert before['htmlSha256']==sha(p/'index.html')and before['directorSha256']==sha(p/'assets/director.js')
 data={'status':'encoded-awaiting-decoded-verification','elapsedSeconds':time.time()-started,'videoSha256':sha(target),'video':str(target.relative_to(R)),'binding':before};(p/'qa/render-progress.json').write_text(json.dumps(data,indent=2));print(s['key']+' full 1100-frame MP4 encoded',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(render,[s for s in rows if not keys or s['key']in keys]))
