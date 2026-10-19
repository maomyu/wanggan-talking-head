from pathlib import Path
import json,subprocess,hashlib,sys,numpy as np
R=Path(__file__).resolve().parents[1];key=sys.argv[1]if len(sys.argv)>1 else'newspaper';version=sys.argv[2]if len(sys.argv)>2 else'1.6.0';a=R/'variants'/key/'outputs/final.mp4';b=R/'portability'/('formal-'+version)/key/'outputs/final.mp4';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();delivery=json.loads((b.parents[1]/'qa/delivery.json').read_text());assert delivery['video']['sha256']==sha(b)
def decode(p,audio=False):return subprocess.check_output(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-i',str(p),*(['-vn','-ac','1','-ar','48000','-f','f32le']if audio else['-vf','fps=1,scale=270:480','-pix_fmt','rgb24','-f','rawvideo']),'pipe:1'])
identical=sha(a)==sha(b);metrics=None
if not identical:
 x,y=[np.frombuffer(decode(p),np.uint8).reshape(-1,480,270,3).astype(float)for p in[a,b]];assert x.shape==y.shape;errors=np.abs(x-y).mean(axis=(1,2,3));metrics=dict(sampledFrames=len(errors),mean=float(errors.mean()),max=float(errors.max()));assert metrics['mean']<.5 and metrics['max']<1.5,metrics
audioA,audioB=[hashlib.sha256(decode(p,True)).hexdigest()for p in[a,b]];assert audioA==audioB
(R/'qa'/('formal-full-reproduction-'+version+'.json')).write_text(json.dumps(dict(ok=True,key=key,version=version,scope='从正式插件独立init/build/check/render/verify生成完整1100帧；与研究成片逐秒像素和完整解码音频比较',sourceSha256=sha(a),formalSha256=sha(b),identicalEncodedFile=identical,pixelMetrics=metrics,decodedVoiceIdentical=True),ensure_ascii=False,indent=2)+'\n');print('Formal full-film reproduction matches checked reference')
