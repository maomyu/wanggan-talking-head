from pathlib import Path
import json,hashlib,subprocess,sys,io
import numpy as np
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];FF='/opt/homebrew/bin/ffmpeg';FP='/opt/homebrew/bin/ffprobe';key=sys.argv[1];p=R/'variants'/key;movie=p/'outputs/final.mp4'
def run(args):return subprocess.check_output(args,stderr=subprocess.DEVNULL)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pcm(p):return np.frombuffer(run([FF,'-v','error','-i',str(p),'-vn','-ac','1','-ar','48000','-f','f32le','pipe:1']),np.float32)
binding=json.loads((p/'qa/source-binding.json').read_text());progress=json.loads((p/'qa/render-progress.json').read_text())
assert sha(p/'index.html')==binding['htmlSha256']==progress['binding']['htmlSha256'];assert sha(p/'assets/director.js')==binding['directorSha256']==progress['binding']['directorSha256']
assert all(sha(p/k)==v for k,v in binding['protected'].items())
probe=json.loads(run([FP,'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(movie)]));v=next(s for s in probe['streams']if s['codec_type']=='video');aud=[s for s in probe['streams']if s['codec_type']=='audio']
assert(v['width'],v['height'],v['r_frame_rate'],v['nb_read_frames'])==(1080,1920,'30/1','1100');assert len(aud)==1
a=pcm(p/'assets/edited-voice.wav').astype(np.float64);b=pcm(movie).astype(np.float64);referenceSamples=len(a);decodedSamples=len(b);peak=float(np.max(np.abs(b)));n=min(len(a),len(b));a=a[:n];b=b[:n]
def corr(x,y):return float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)))
c=corr(a,b);windows=[corr(a[i:i+48000],b[i:i+48000])for i in range(0,n-48000+1,48000)]
size=1<<(2*n-1).bit_length();cc=np.fft.irfft(np.fft.rfft(b,size)*np.conj(np.fft.rfft(a,size)),size);lags=np.r_[np.arange(0,1601),np.arange(size-1600,size)];ix=int(lags[np.argmax(cc[lags])]);lag=ix if ix<=1600 else ix-size
assert c>.98 and min(windows)>.97 and abs(lag)<=1,(key,c,min(windows),lag)
dest=p/'qa/decoded';dest.mkdir(exist_ok=True);frames=[0,148,149,150,172,240,387,388,389,420,460,461,462,485,567,615,616,617,640,732,855,856,857,879,897,898,899,922,1071,1099]
select='+'.join(f'eq(n\\,{f})'for f in frames);subprocess.run([FF,'-v','error','-i',str(movie),'-vf',f'select={select}','-fps_mode','vfr','-q:v','2',str(dest/'selected-%03d.jpg')],check=True)
for i,f in enumerate(frames,1):(dest/f'selected-{i:03d}.jpg').replace(dest/f'f{f}.jpg')
dense=p/'qa/dense';dense.mkdir(exist_ok=True);subprocess.run([FF,'-v','error','-i',str(movie),'-vf',r'select=not(mod(n\,6)),scale=162:288','-fps_mode','vfr','-q:v','4',str(dense/'f-%03d.jpg')],check=True)
assert len(list(dense.glob('f-*.jpg')))==184
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Unicode.ttf',16)
def sheet(fs,name,w=216,cols=7):
 h=round(w*16/9);gap=8;rows=(len(fs)+cols-1)//cols;im=Image.new('RGB',(cols*(w+gap)+gap,rows*(h+32+gap)+gap),'#e9e7e0');d=ImageDraw.Draw(im)
 for i,f in enumerate(fs):
  x=gap+(i%cols)*(w+gap);y=gap+(i//cols)*(h+32+gap);im.paste(Image.open(dest/f'f{f}.jpg').resize((w,h)),(x,y));d.text((x,y+h+4),f'{key} {f/30:.2f}s',font=font,fill='#17211c')
 im.save(p/'qa'/name,quality=91)
sheet([0,240,420,567,732,879,1071],'encoded-story.jpg');sheet(frames,'encoded-cuts.jpg',162,10)
samples=json.loads((R/'qa/prototypes.json').read_text());native=next((s for s in samples if s['key']==key),None);differences=[]
if native:
 for state in native['states']:
  f=state['frame']
  if f not in frames:continue
  x,y,w=state['portrait']['x'],state['portrait']['y'],state['portrait']['w'];crop=tuple(map(int,(x+w*.24,y+w*.24,x+w*.76,y+w*.76)))
  a=np.asarray(Image.open(p/f'qa/stills/f{f}.jpg').convert('RGB').crop(crop),dtype=np.float32);b=np.asarray(Image.open(dest/f'f{f}.jpg').convert('RGB').crop(crop),dtype=np.float32);differences.append({'frame':f,'personInteriorMeanAbsoluteRGBError':float(np.abs(a-b).mean())})
result={'key':key,'status':'verified-encoded','source':binding,'videoSha256':sha(movie),'probe':{'width':1080,'height':1920,'fps':30,'frames':1100,'duration':float(probe['format']['duration']),'audioTracks':1},'audio':{'normalizedCorrelation':c,'oneSecondCorrelations':windows,'lagSamples':lag,'decodedPeak':peak,'referenceSamples':referenceSamples,'decodedSamples':decodedSamples},'decodedSelectedFrames':frames,'denseIntervalFrames':6,'denseFrameCount':184,'nativeVsEncodedPerson':differences,'limits':'Author review plus measured invariants. Native/compressed pixel difference is a diagnostic, not universal color certification. No independent blind review or new source edits/audio design.'}
(p/'qa/film-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));progress.update(status='verified',verification='qa/film-verification.json');(p/'qa/render-progress.json').write_text(json.dumps(progress,indent=2));print(json.dumps({'key':key,'frames':1100,'audioCorrelation':c,'lagSamples':lag,'decodedFrames':len(frames),'denseFrames':184}),flush=True)
