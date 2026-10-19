from pathlib import Path
import subprocess,json,sys,concurrent.futures,threading,hashlib
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';lock=threading.Lock();results={}
def job(key):
 P=R/'variants'/key
 reuse=False
 if(P/'qa/delivery.json').exists()and(P/'qa/build-state.json').exists()and(P/'outputs/final.mp4').exists():
  record=json.loads((P/'qa/delivery.json').read_text());inputs=json.loads((P/'qa/build-state.json').read_text())['inputs'];verified=json.loads((P/'project.json').read_text()).get('status')=='verified'
  # A build/check rewrites build-state before an encode exists. Its inputs
  # cannot authenticate the preceding MP4; the runtime resets status to built.
  reuse=verified and all((P/f).exists()and hashlib.sha256((P/f).read_bytes()).hexdigest()==h for f,h in inputs.items())and hashlib.sha256((P/'outputs/final.mp4').read_bytes()).hexdigest()==record['video']['sha256']
 if not reuse:
  with(R/'qa'/f'{key}-full-current.log').open('w')as log:subprocess.run(['node',str(APP/'scripts/studio.mjs'),'run','--project',str(P)],stdout=log,stderr=subprocess.STDOUT,check=True)
 # Keep completed evidence when both source inputs and the exact encode still match.
 proof_file=R/'qa'/f'{key}-verification.json'
 proof_current=reuse and proof_file.exists()and json.loads(proof_file.read_text()).get('ok')and json.loads(proof_file.read_text()).get('lastFramePresenter',{}).get('ok')and json.loads(proof_file.read_text()).get('sha256')==hashlib.sha256((P/'outputs/final.mp4').read_bytes()).hexdigest()
 if not proof_current:
  with(R/'qa'/f'{key}-pixel-check.log').open('w')as log:subprocess.run([str(APP/'runtime/.venv/bin/python'),str(R/'scripts/verify-output.py'),key],stdout=log,stderr=subprocess.STDOUT,check=True)
 result=json.loads((R/'qa'/f'{key}-verification.json').read_text());assert result['ok']
 with lock:
  results[key]=dict(stage='actual-encode-program-verified',sha256=result['sha256'],frames=result['frames'],voiceAndCircleChecked=True,reusedVerifiedArtifact=bool(proof_current))
  (R/'qa/render-batch.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));p=R/'progress.json';d=json.loads(p.read_text())
  for s in d['styles']:
   if s['key']==key:s.update(stage='full-video-program-verified-awaiting-author-review',video='variants/'+key+'/outputs/final.mp4')
  p.write_text(json.dumps(d,ensure_ascii=False,indent=2))
 print(key+' full MP4 and pixel/audio checks passed',flush=True);return key
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:
 for key in pool.map(job,sys.argv[1:]):pass
