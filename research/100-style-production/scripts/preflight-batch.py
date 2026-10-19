from pathlib import Path
import subprocess,sys,json
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
results=[]
for key in sys.argv[1:]:
 p=R/'variants'/key
 with(R/'qa'/f'{key}-preflight.log').open('w')as log:code=subprocess.run(['node',str(APP/'scripts/studio.mjs'),'run','--project',str(p),'--until','check'],stdout=log,stderr=subprocess.STDOUT).returncode
 results.append(dict(key=key,ok=code==0))
 print(key+(' check passed'if code==0 else' check FAILED'),flush=True)
(R/'qa/preflight-batch.json').write_text(json.dumps(dict(ok=all(s['ok']for s in results),results=results),indent=2))
if not all(s['ok']for s in results):sys.exit(1)
