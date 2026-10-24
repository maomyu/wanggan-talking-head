from pathlib import Path
import sys,json,subprocess,hashlib,wave,re,shutil
from fractions import Fraction

plugin=Path(__file__).resolve().parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2))
def call(args):
 if args[0]=='ffmpeg':args=[args[0],'-threads','2','-filter_threads','2',*args[1:]]
 return subprocess.check_output(args)
def prepare(root):
 import numpy as np
 from fontTools.ttLib import TTFont
 plan=json.loads((root/'edit-plan.json').read_text());rate=48000;fps=Fraction(str(plan['fps']));tailPadding=0
 metadata=json.loads((root/'source-info.json').read_text());v=next(x for x in metadata['streams']if x['codec_type']=='video');videoSamples=round(float(v.get('duration',metadata['format']['duration']))*rate)
 wav=root/'assets/edited-voice.wav';sourceHash=sha(root/'assets/master.mp4');edlHash=sha(root/'edit-plan.json')
 revision=json.loads((root/'revision.json').read_text())if(root/'revision.json').exists()else{}
 cached=json.loads((root/'qa/audio-conform.json').read_text())if(root/'qa/audio-conform.json').exists()else{}
 binding=revision.get('voiceBinding')or cached.get('binding')or json.loads((root/'project.json').read_text()).get('productionReference')or{}
 bound=wav.exists()and binding.get('sourceSha256')==sourceHash and binding.get('edlSha256')==edlHash and binding.get('voiceSha256')==sha(wav)
 if wav.exists()and 'assets/edited-voice.wav'in revision.get('protectedInputs',{})and not bound:raise ValueError('受保护原声缺少匹配的源片/EDL绑定；不能在视觉修改中重编码')
 if bound:
  with wave.open(str(wav))as w:
   voiceSamples=w.getnframes();assert w.getframerate()==rate and voiceSamples==round(Fraction(plan['frameCount'])*rate/fps)
  save(root/'qa/audio-conform.json',{'preserved':True,'sampleRate':rate,'samplesPerChannel':voiceSamples,'binding':binding,'wavSha256':sha(wav)})
 else:
  raw=call(['ffmpeg','-v','error','-i',str(root/'assets/master.mp4'),'-vn','-ar',str(rate),'-ac','2','-f','f32le','-']);source=np.frombuffer(raw,dtype='<f4').reshape(-1,2);parts=[]
  for seg in plan['audioSegments']:
   a=round(Fraction(seg['sourceIn'])*rate/fps);b=round(Fraction(seg['sourceOut'])*rate/fps);part=source[a:b].copy();expected=round(Fraction(seg['outputOut']-seg['outputIn'])*rate/fps)
   if len(part)!=expected:
    short=expected-len(part)
    if b>len(source) and 0<short<=round(rate/fps) and b<=videoSamples+1:
     part=np.pad(part,((0,short),(0,0)));tailPadding+=short
    else:raise ValueError('源音频区间不完整或帧时间不匹配')
   parts.append(part)
  fade=plan.get('audio',{}).get('fadeSamplesAtActualSeams',240)
  for i in range(len(parts)-1):
   size=min(fade,len(parts[i])//2,len(parts[i+1])//2)
   if size:parts[i][-size:]*=np.linspace(1,0,size)[:,None];parts[i+1][:size]*=np.linspace(0,1,size)[:,None]
  voice=np.concatenate(parts);expected=round(Fraction(plan['frameCount'])*rate/fps);delta=expected-len(voice)
  if abs(delta)>len(parts):raise ValueError('音频累计长度不匹配')
  if delta>0:voice=np.pad(voice,((0,delta),(0,0)))
  elif delta<0:voice=voice[:expected]
  wav=root/'assets/edited-voice.wav'
  with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes(np.round(np.clip(voice,-1,1)*32767).astype('<i2').tobytes())
  save(root/'qa/audio-conform.json',{'sampleRate':rate,'channels':2,'samplesPerChannel':len(voice),'segments':plan['audioSegments'],'fadeSamplesPerSide':fade,'sourceTailSilencePaddingSamples':tailPadding,'wavSha256':sha(wav)})
  voiceSamples=len(voice)
  report=json.loads((root/'qa/audio-conform.json').read_text());report['binding']={'sourceSha256':sourceHash,'edlSha256':edlHash,'voiceSha256':sha(wav)};save(root/'qa/audio-conform.json',report)
 html=(root/'index.html').read_text();body=re.sub(r'<script[^>]*>.*?</script>|<style[^>]*>.*?</style>','',html,flags=re.S);body=re.sub('<[^>]*>','',body);font_report=[];dest=root/'assets/fonts';dest.mkdir(exist_ok=True)
 usage=json.loads((root/'font-usage.json').read_text())if(root/'font-usage.json').exists()else None
 if usage is not None:
  known={x['file']for x in json.loads((plugin/'assets/fonts/catalog.json').read_text())}
  if not isinstance(usage.get('fonts'),dict)or not usage['fonts']or any(k not in known or not isinstance(v,str)for k,v in usage['fonts'].items()):raise ValueError('font-usage需要已登记字体到实际字符的非空映射')
 for item in json.loads((plugin/'assets/fonts/catalog.json').read_text()):
  name=item['file'];target=dest/name
  if not target.exists():shutil.copyfile(plugin/'assets/fonts'/name,target)
  font=TTFont(target);required=usage['fonts'].get(name,'')if usage else('0123456789' if name.startswith('Archivo') else body);missing=sorted({c for c in required if not c.isspace() and ord(c) not in font.getBestCmap()})
  if missing:raise ValueError(f'{name} 缺字：{missing}。补充可用字体后再运行。')
  font_report.append({'font':name,'missing':missing,'checkedCharacters':len(set(required)),'coverageScope':usage.get('scope','declared-project-usage')if usage else'conservative-static-html','sha256':sha(target),'source':'bundled' if sha(target)==item['sha256'] else 'project override'})
 save(root/'qa/font-coverage.json',font_report)
 print(json.dumps({'audioSamples':voiceSamples,'fontsChecked':len(font_report)}))

def verify(root):
 import numpy as np
 p=root/'outputs/final.mp4';t=json.loads((root/'timing.json').read_text());info=json.loads(call(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in info['streams'] if s['codec_type']=='video')
 project=json.loads((root/'project.json').read_text());canvas=json.loads((root/'plans/brief.json').read_text())
 assert int(v['nb_read_frames'])==t['frameCount'] and v['width']==canvas['width'] and v['height']==canvas['height']
 assert abs(float(Fraction(v['avg_frame_rate']))-float(t['fps']))<1e-5 and abs(float(info['format']['duration'])-t['duration'])<.03
 def pcm(f):return call(['ffmpeg','-v','error','-i',str(f),'-vn','-ar','48000','-ac','1','-f','f32le','-'])
 a=pcm(root/'assets/edited-voice.wav');b=pcm(p);x=np.frombuffer(a,dtype='<f4').astype(float);y=np.frombuffer(b,dtype='<f4')[:len(x)].astype(float);assert len(x)==len(y)
 corr=float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)));size=1<<(2*len(x)-1).bit_length();c=np.fft.irfft(np.fft.rfft(x,size)*np.conj(np.fft.rfft(y,size)),size);bound=4000;lag=int(np.argmax(np.r_[c[-bound:],c[:bound+1]])-bound);n=len(x)//2000*2000;xr=np.sqrt(np.mean(x[:n].reshape(-1,2000)**2,axis=1));yr=np.sqrt(np.mean(y[:n].reshape(-1,2000)**2,axis=1));dropped=int(np.count_nonzero((xr>.01)&(yr<.0001)));assert corr>.98 and abs(lag)<=round(48000/t['fps']) and dropped==0
 frame_indices=sorted(set(np.linspace(0,t['frameCount']-1,16,dtype=int).tolist()));folder=root/'qa/frames';folder.mkdir(exist_ok=True)
 for pattern in ('frame-*.png','dense-*.jpg'):
  for old_frame in folder.glob(pattern):old_frame.unlink()
 select="select='"+'+'.join(f'eq(n,{f})' for f in frame_indices)+"'"
 subprocess.run(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-y','-i',str(p),'-vf',select+',scale=270:480:flags=lanczos','-fps_mode','passthrough',str(folder/'frame-%03d.png')],check=True)
 subprocess.run(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-y','-i',str(p),'-vf','fps=5,scale=360:640:flags=lanczos','-q:v','4',str(folder/'dense-%03d.jpg')],check=True)
 subprocess.run(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-y','-framerate','1','-i',str(folder/'frame-%03d.png'),'-vf','tile=4x4','-frames:v','1','-update','1',str(root/'outputs/contact.jpg')],check=True)
 subprocess.run(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-y','-i',str(p),'-frames:v','1','-update','1',str(root/'outputs/poster.jpg')],check=True)
 save(root/'qa/delivery.json',{'projectId':project['id'],'video':{'width':v['width'],'height':v['height'],'fps':v['avg_frame_rate'],'frames':int(v['nb_read_frames']),'duration':float(info['format']['duration']),'sha256':sha(p)},'audio':{'referenceCorrelation':corr,'offsetSamples':lag,'droppedVoiceWindows':dropped,'decodedMonoSha256':hashlib.sha256(b).hexdigest(),'referenceWavSha256':sha(root/'assets/edited-voice.wav')},'htmlSha256':sha(root/'index.html'),'timingSha256':sha(root/'timing.json'),'contactFrames':frame_indices,'dense5fpsFrames':len(list(folder.glob('dense-*.jpg'))),'review':'程序核验；审美和听感需要查看实际产物，非独立盲评'})
 print(json.dumps({'verified':True,'frames':t['frameCount'],'audioCorrelation':corr,'offsetSamples':lag}))

if __name__=='__main__':
 command=sys.argv[1];root=Path(sys.argv[2]).resolve()
 if command=='prepare':prepare(root)
 elif command=='verify':verify(root)
 else:raise ValueError('Unknown command')
