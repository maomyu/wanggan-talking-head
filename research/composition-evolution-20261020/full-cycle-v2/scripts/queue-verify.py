from pathlib import Path
import json,time,subprocess
R=Path(__file__).resolve().parents[1];PY=Path.home()/'plugins/wanggan-talking-head/runtime/.venv/bin/python';keys=['minimal','magazine','type-poster','comic','origami','blueprint','film','clay','archive-dossier','precision','ink','sci-fi-wireframe']
for k in keys:
 p=R/'variants'/k/'qa/render-progress.json'
 while not p.exists()or json.loads(p.read_text())['status']=='rendering':time.sleep(5)
 subprocess.run([str(PY),str(R/'scripts/verify-film.py'),k],check=True)
