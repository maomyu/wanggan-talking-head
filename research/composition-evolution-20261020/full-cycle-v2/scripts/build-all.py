from pathlib import Path
import json,subprocess,hashlib,shutil,sys,concurrent.futures
R=Path(__file__).resolve().parents[1];rows=json.loads((R/'catalogue.json').read_text())['styles'];keys=sys.argv[1:]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build(s):
 p=R/'variants'/s['key'];protected={str(k.relative_to(p)):sha(k)for k in [p/'assets/master.mp4',p/'assets/edited-voice.wav',p/'plans/edit-plan.json']}
 for name in ['director.js','build-project.mjs']:shutil.copyfile(R/'scripts'/name,p/'scripts'/name)
 with(p/'qa/build.log').open('w')as log:subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],check=True,stdout=log,stderr=subprocess.STDOUT)
 assert all(sha(p/k)==v for k,v in protected.items())
 (p/'qa/source-binding.json').write_text(json.dumps({'htmlSha256':sha(p/'index.html'),'directorSha256':sha(p/'assets/director.js'),'buildSha256':sha(p/'scripts/build-project.mjs'),'protected':protected},indent=2));print(s['key']+' rebuilt with designed content plan',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(build,[s for s in rows if not keys or s['key']in keys]))
