"""Continue the authorized batch with two renders maximum; checks precede encoding."""
from pathlib import Path
import json,time,subprocess,concurrent.futures
R=Path(__file__).resolve().parents[1];PY=Path.home()/'plugins/wanggan-talking-head/runtime/.venv/bin/python'
def ready(key):
 p=R/'variants'/key/'qa/render-progress.json'
 return p.exists()and json.loads(p.read_text())['status']in ['encoded-awaiting-decoded-verification','verified']
while not all(ready(k)for k in ['minimal','magazine']):time.sleep(5)
keys=['type-poster','comic','origami','blueprint','film','clay','archive-dossier','precision','ink','sci-fi-wireframe']
def work(key):
 p=R/'variants'/key/'qa/full-check.json'
 while True:
  try:
   a=json.loads(p.read_text())
   if a['exitCode']==0 and a['result']['ok']:break
  except (FileNotFoundError,json.JSONDecodeError):pass
  time.sleep(5)
 subprocess.run([str(PY),str(R/'scripts/render-all.py'),key],check=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(work,keys))
