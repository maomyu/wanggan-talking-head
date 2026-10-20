from pathlib import Path
import json,shutil,subprocess
R=Path(__file__).resolve().parents[1]
shutil.copyfile(Path.home()/'plugins/wanggan-talking-head/runtime/scripts/serve.py',R/'serve.py')
(R/'project.json').write_text(json.dumps({'id':'composition-evolution-20261020'}))
old=R/'qa/preview-server.json'
if old.exists():
 import urllib.request
 try:
  d=json.loads(old.read_text());r=json.load(urllib.request.urlopen(d['url']+'health',timeout=1))
  if r['projectId']=='composition-evolution-20261020':print(d['url']);raise SystemExit
 except OSError:pass
with (R/'qa/server.log').open('a')as log:subprocess.Popen([str(Path.home()/'plugins/wanggan-talking-head/runtime/.venv/bin/python'),str(R/'serve.py'),'--project',str(R)],stdout=log,stderr=log,start_new_session=True)
