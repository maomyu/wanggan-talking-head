from pathlib import Path
import json,subprocess,sys,os,argparse,concurrent.futures
R=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--revision',required=True);p.add_argument('--windows',type=Path);p.add_argument('keys',nargs='+');o=p.parse_args();starts=json.loads(o.windows.read_text())if o.windows else{}
def job(key):
 env={**os.environ,'WG_SMOKE_REV':o.revision,'WG_SMOKE_START':str(starts.get(key,4.5))}
 with(R/'qa'/f'{key}-{o.revision}.log').open('w')as log:subprocess.run([sys.executable,str(R/'scripts/smoke.py'),key],env=env,stdout=log,stderr=subprocess.STDOUT,check=True)
 print(key+' actual 4s encode checked at '+env['WG_SMOKE_START'],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(job,o.keys))
