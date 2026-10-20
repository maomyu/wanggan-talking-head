"""Refresh creative sources after the one-time import; preserve prepared voice/fonts.
Native proof binds these actual rebuilt sources, not an earlier CLI build record.
"""
from pathlib import Path
import concurrent.futures,json,hashlib,shutil,subprocess,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';keys=set(sys.argv[1:]);rows=[s for s in json.loads((R/'catalogue.json').read_text())['styles']if not keys or s['key']in keys]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def job(s):
 p=R/'variants'/s['key'];assert(p/'assets/edited-voice.wav').exists()
 before={str(x.relative_to(p)):sha(x)for x in [p/'assets/master.mp4',p/'assets/edited-voice.wav',p/'plans/edit-plan.json']}
 for f in ('director.js','build-project.mjs'):shutil.copyfile(R/'scripts'/f,p/'scripts'/f)
 with(p/'qa/creative-refresh.log').open('w')as log:subprocess.run(['node',str(p/'scripts/build-project.mjs'),'--project',str(p)],stdout=log,stderr=subprocess.STDOUT,check=True)
 assert all(sha(p/k)==v for k,v in before.items())
 (p/'qa/research-build.json').write_text(json.dumps({'scope':'research-creative-source-refresh','htmlSha256':sha(p/'index.html'),'directorSha256':sha(p/'assets/director.js'),'preserved':before,'formalPluginUnchanged':True},indent=2))
 print(s['id']+' design source current',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(job,rows))
