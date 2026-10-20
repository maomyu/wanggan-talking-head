from pathlib import Path
import json,time,subprocess,concurrent.futures
R=Path(__file__).resolve().parents[1];PY=Path.home()/'plugins/wanggan-talking-head/runtime/.venv/bin/python'
keys=['minimal','magazine','type-poster','origami','blueprint','archive-dossier','precision','ink','sci-fi-wireframe']
def done(k):
 p=R/'variants'/k/'qa/render-progress.json'
 return p.exists()and json.loads(p.read_text())['status']=='verified'
while not all(done(k)for k in keys):time.sleep(5)
def repair(key):
 p=R/'variants'/key/'qa/full-check.json'
 while True:
  try:
   c=json.loads(p.read_text());b=json.loads((R/'variants'/key/'qa/source-binding.json').read_text())
   if c['exitCode']==0 and c['result']['ok'] and c['htmlSha256']==b['htmlSha256'] and c['directorSha256']==b['directorSha256']:break
  except (FileNotFoundError,json.JSONDecodeError):pass
  time.sleep(5)
 subprocess.run([str(PY),str(R/'scripts/render-all.py'),key],check=True)
 subprocess.run([str(PY),str(R/'scripts/verify-film.py'),key],check=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(repair,['comic','film','clay']))
