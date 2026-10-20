"""Small complete previews for genuine100-way inline playback; originals stay intact."""
from pathlib import Path
import concurrent.futures,hashlib,json,subprocess,threading,time

R=Path(__file__).resolve().parents[1]
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
catalogue=read(R/'catalogue-full.json');state=read(R/'qa/batch-state.json')
target=R/'qa/grid-preview-index.json';lock=threading.Lock();started=time.time()
index=read(target)if target.exists()else{'kind':'inline-complete-previews','width':216,'height':384,'fps':12,'frames':440,'duration':1100/30,'audio':'one shared original voice, video previews contain no audio','voice':'variants/minimal/assets/edited-voice.wav','styles':{}}
index['voiceSha256']=sha(R/index['voice'])
assert index['voiceSha256']==read(R/'variants/minimal/qa/batch-source-binding.json')['inputs']['assets/edited-voice.wav']
def work(s):
 key=s['key'];p=R/'variants'/key;source=p/'outputs/final.mp4';out=p/'outputs/grid-preview.mp4';part=p/'outputs/grid-preview.partial.mp4';source_sha=sha(source)
 assert source_sha==state['jobs'][key]['videoSha256']
 old=index['styles'].get(key)
 if old and old['sourceSha256']==source_sha and out.exists()and sha(out)==old['sha256']:return
 command=['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','1','-i',str(source),'-vf','fps=12,scale=216:384:flags=lanczos','-an','-c:v','libx264','-preset','veryfast','-tune','fastdecode','-profile:v','baseline','-crf','24','-pix_fmt','yuv420p','-g','24','-threads','1','-movflags','+faststart',str(part)]
 result=subprocess.run(command,capture_output=True,text=True)
 if result.returncode:raise RuntimeError(key+': '+result.stderr[-1600:])
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(part)],text=True));streams=probe['streams'];v=streams[0]
 assert len(streams)==1 and v['codec_type']=='video'and v['width']==216 and v['height']==384 and v['r_frame_rate']=='12/1'and int(v['nb_frames'])==440
 assert abs(float(probe['format']['duration'])-1100/30)<.001
 part.replace(out)
 with lock:
  index['styles'][key]={'url':f'variants/{key}/outputs/grid-preview.mp4','sourceSha256':source_sha,'sha256':sha(out),'bytes':out.stat().st_size,'frames':440,'verified':True}
  index.update(verified=len(index['styles']),total=len(catalogue['styles']),elapsedSeconds=time.time()-started)
  tmp=target.with_suffix('.tmp');tmp.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n');tmp.replace(target)
  print(f"{key}: {len(index['styles'])}/100 preview verified",flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:list(pool.map(work,catalogue['styles']))
assert len(index['styles'])==100
print(json.dumps({'complete':100,'framesEach':440,'size':[216,384],'fps':12,'seconds':time.time()-started,'bytes':sum(x['bytes']for x in index['styles'].values())}),flush=True)
