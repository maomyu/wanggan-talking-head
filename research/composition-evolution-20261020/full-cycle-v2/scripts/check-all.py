from pathlib import Path
import json,subprocess,hashlib,concurrent.futures,sys
R=Path(__file__).resolve().parents[1];HF=Path.home()/'plugins/wanggan-talking-head/runtime/node_modules/hyperframes/bin/hyperframes.mjs';keys=sys.argv[1:];rows=json.loads((R/'catalogue.json').read_text())['styles']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(s):
 p=R/'variants'/s['key']
 with(p/'qa/full-check.log').open('w')as log:run=subprocess.run(['node',str(HF),'check','--json','--snapshots',str(p)],stdout=log,stderr=subprocess.STDOUT)
 raw=(p/'qa/full-check.log').read_text();i=raw.find('{\n  "ok"');result=json.JSONDecoder().raw_decode(raw[i:])[0]if i>=0 else{'ok':False,'raw':raw[-2500:]}
 data={'exitCode':run.returncode,'htmlSha256':sha(p/'index.html'),'directorSha256':sha(p/'assets/director.js'),'motionAssertionsSha256':sha(p/'index.motion.json'),'result':result};(p/'qa/full-check.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
 print(s['key']+' '+('CHECK PASS'if run.returncode==0 and result['ok']else'CHECK FAILED'),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(check,[s for s in rows if not keys or s['key']in keys]))
