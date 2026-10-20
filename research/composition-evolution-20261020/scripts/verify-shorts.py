from pathlib import Path
import hashlib,json,subprocess,io,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];FF='/opt/homebrew/bin/ffmpeg';FP='/opt/homebrew/bin/ffprobe'
allkeys=['magazine','type-poster','origami','blueprint','clay','precision'];keys=sys.argv[1:]or allkeys;out=[s for s in json.loads((R/'qa/short-video-verification.json').read_text())if s['key']not in keys]if sys.argv[1:]else[]
def run(args):return subprocess.check_output(args,stderr=subprocess.DEVNULL)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pcm(p,start=None,duration=None):
 cmd=[FF,'-v','error'];cmd+=['-ss',str(start)]if start is not None else[];cmd+=['-i',str(p)];cmd+=['-t',str(duration)]if duration else[]
 return np.frombuffer(run(cmd+['-vn','-ac','1','-ar','48000','-f','f32le','pipe:1']),np.float32)
for key in keys:
 rev='v6'if key=='origami'else'v7'if key=='clay'else'v5';p=R/('short-tests-'+rev)/key;movie=p/'outputs/sample.mp4'
 assert movie.exists(),str(movie)+' missing'
 probe=json.loads(run([FP,'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(movie)]));v=next(s for s in probe['streams']if s['codec_type']=='video');aud=[s for s in probe['streams']if s['codec_type']=='audio']
 assert(v['width'],v['height'],v['r_frame_rate'],v['nb_read_frames'])==(1080,1920,'30/1','240'),(key,v)
 assert len(aud)==1
 ref=pcm(p/'assets/edited-voice.wav',461/30,8);got=pcm(movie);n=min(len(ref),len(got));a=ref[:n].astype(np.float64);b=got[:n].astype(np.float64)
 corr=float(np.dot(a,b)/np.sqrt(np.dot(a,a)*np.dot(b,b)))
 windows=[float(np.dot(a[i:i+48000],b[i:i+48000])/np.sqrt(np.dot(a[i:i+48000],a[i:i+48000])*np.dot(b[i:i+48000],b[i:i+48000])))for i in range(0,n-48000+1,48000)]
 # FFT cross correlation reports actual sample alignment, not AAC byte equality.
 size=1<<(2*n-1).bit_length();cc=np.fft.irfft(np.fft.rfft(b,size)*np.conj(np.fft.rfft(a,size)),size);lags=np.r_[np.arange(0,1601),np.arange(size-1600,size)];ix=int(lags[np.argmax(cc[lags])]);lag=ix if ix<=1600 else ix-size
 assert corr>.98 and min(windows)>.97 and abs(lag)<=1,(key,corr,windows,lag)
 frames=p/'qa/decoded';frames.mkdir(exist_ok=True);images=[]
 for frame in [0,106,154,165,239]:
  data=run([FF,'-v','error','-i',str(movie),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-f','image2pipe','-vcodec','png','pipe:1']);image=Image.open(io.BytesIO(data)).convert('RGB');image.save(frames/f'f{frame}.jpg',quality=93);images.append(image)
 native=Image.open(R/'variants'/key/'qa/stills/f567.jpg').convert('RGB');decoded=images[1];mae=float(np.abs(np.asarray(native,dtype=np.float32)-np.asarray(decoded,dtype=np.float32)).mean())
 state=next(s for s in json.loads((R/'qa/native-samples.json').read_text())if s['key']==key);portrait=state['samples'][1]['portrait'];x,y,w=portrait['x'],portrait['y'],portrait['w'];crop=(int(x+w*.24),int(y+w*.24),int(x+w*.76),int(y+w*.76));face_mae=float(np.abs(np.asarray(native.crop(crop),dtype=np.float32)-np.asarray(decoded.crop(crop),dtype=np.float32)).mean())
 record={'key':key,'revision':rev,'path':str(movie.relative_to(R)),'videoSha256':sha(movie),'directorSha256':sha(p/'assets/director.js'),'htmlSha256':sha(p/'index.html'),'probe':{'width':1080,'height':1920,'frames':240,'fps':30,'duration':float(probe['format']['duration']),'audioTracks':len(aud)},'sourceMapping':{'sourceIn':461,'sourceOut':701,'outputFrames':240},'audio':{'samplesReference':len(ref),'samplesDecoded':len(got),'normalizedCorrelation':corr,'oneSecondCorrelations':windows,'lagSamples':lag},'nativeVsEncodedAtSource567':{'fullFrameMeanAbsoluteRGBError':mae,'presenterInteriorMeanAbsoluteRGBError':face_mae,'scope':'Decoded frame106 vs browser source-frame567 JPEG. Diagnostic plus actual visual inspection; not a universal color grade metric.'},'decodedFrames':[0,106,154,165,239]}
 out.append(record);print(key,json.dumps({'corr':round(corr,6),'lag':lag,'imageMAE':round(mae,2),'faceMAE':round(face_mae,2)}),flush=True)
(R/'qa/short-video-verification.json').write_text(json.dumps(out,indent=2))
