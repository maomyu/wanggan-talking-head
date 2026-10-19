from pathlib import Path
import json,subprocess,hashlib,sys,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];P=json.loads((R/'edit-plan.json').read_text());look=sys.argv[1];V=R/'variants'/look/'outputs/final.mp4'
def run(c):
    if c[0]=='ffmpeg':c=[c[0],'-threads','2','-filter_threads','2',*c[1:]]
    return subprocess.check_output(c,stderr=subprocess.DEVNULL)
_proof_cache={}
def image(p,t):
    # One sequential decode for the exact same proof frames; avoid decoding
    # the long-GOP video anew for every adjacent cut sample.
    if p==V:
        if not _proof_cache:
            frames=sorted(set([0,567,P['frameCount']-1]+[round(t*30)for t in P['qaTimes']]+[s['startFrame']+d for s in P['scenes'][1:]for d in [-1,0,1]]))
            folder=R/f"qa/proof-{look}-{hashlib.sha256(V.read_bytes()).hexdigest()[:10]}"
            folder.mkdir(exist_ok=True)
            select='+'.join(f'eq(n\\,{n})'for n in frames)
            run(['ffmpeg','-v','error','-y','-i',str(V),'-vf','select='+select,'-fps_mode','vfr',str(folder/'%03d.png')])
            assert len(list(folder.glob('*.png')))==len(frames)
            _proof_cache.update({n:folder/f'{i+1:03d}.png'for i,n in enumerate(frames)})
        key=round(t*30)
        if key in _proof_cache:return Image.open(_proof_cache[key]).convert('RGB')
    raw=run(['ffmpeg','-v','error','-ss',str(max(0,t-.0005)),'-i',str(p),'-frames:v','1','-f','image2pipe','-vcodec','png','pipe:1'])
    import io
    return Image.open(io.BytesIO(raw)).convert('RGB')
_decoded_audio={}
def audio(p,t=0,d=None):
    if p not in _decoded_audio:
        _decoded_audio[p]=np.frombuffer(run(['ffmpeg','-v','error','-i',str(p),'-vn','-ac','1','-ar','48000','-f','f32le','pipe:1']),np.float32)
    a=_decoded_audio[p]
    return a[round(t*48000):round((t+d)*48000)if d else None]
q=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(V)]));v=next(x for x in q['streams']if x['codec_type']=='video');a=next(x for x in q['streams']if x['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1080,1920,'30/1',P['frameCount'])
assert abs(float(v['duration'])-P['duration'])<.001 and abs(float(a['duration'])-P['duration'])<1/30
wave=audio(V);audioHash=hashlib.sha256(wave.tobytes()).hexdigest()
speech=[]
for t in [2,8,24,34]:
    x=audio(R/'variants'/look/'assets/master.mp4',t,1).astype(float);y=audio(V,t,1).astype(float);n=min(len(x),len(y));x=x[:n];y=y[:n];c=float(np.dot(x,y)/np.sqrt(np.dot(x,x)*np.dot(y,y)));assert c>.985;speech.append(dict(time=t,zeroLagCorrelation=c))
frame=image(V,18.9);source=image(R/'variants'/look/'assets/master.mp4',18.9)
geometry=json.loads((R/'qa/design-qa.json').read_text());g=next(x for x in geometry['results']if x['look']==look);b=g['pixelPose']
rx=round(b['x']+.30*b['width']);ry=round(b['y']+.29*b['height']);rw=round(.4*b['width']);rh=round(.38*b['height'])
ref=source.transform((rw,rh),Image.Transform.AFFINE,(840/b['width'],0,(rx-b['x'])*840/b['width'],0,840/b['height'],(ry-b['y'])*840/b['height']),Image.Resampling.BICUBIC)
actual=frame.crop((rx,ry,rx+rw,ry+rh));x=np.array(ref).astype(float);y=np.array(actual).astype(float)
meanError=np.mean(y-x,axis=(0,1));mae=float(np.abs(x-y).mean());assert max(abs(meanError))<5 and mae<10,(look,meanError,mae)
corners=[];designFrame=Image.open(R/f'qa/design-frames/{look}-18.9.png').convert('RGB')
for u,w in [(0.04,.04),(.94,.04),(.04,.94),(.94,.94)]:
    cx=round(b['x']+u*b['width']);cy=round(b['y']+w*b['height']);box=(cx,cy,cx+5,cy+5);real=np.array(frame.crop(box)).astype(float).mean(axis=(0,1));expected=np.array(designFrame.crop(box)).astype(float).mean(axis=(0,1));sx=round(u*840);sy=round(w*840);old=np.array(source.crop((sx,sy,sx+14,sy+14))).astype(float).mean(axis=(0,1));distance=float(np.abs(real-old).mean());backgroundError=float(np.abs(real-expected).mean());assert backgroundError<10,(look,'encoded corner differs from reviewed background',backgroundError);corners.append(dict(u=u,v=w,sourceDifference=distance,reviewedBackgroundError=backgroundError))
assert sum(c['sourceDifference']>15 for c in corners)>=2,(look,'insufficient distinguishing corner samples',corners)
patch=Image.new('RGB',(rw*2,rh+25),'#e5dfd4');patch.paste(ref,(0,25));patch.paste(actual,(rw,25));dr=ImageDraw.Draw(patch);dr.text((4,4),'source',fill='#222');dr.text((rw+4,4),look+' encoded',fill='#222');patch.save(R/f'qa/{look}-face-color.jpg',quality=95)
dense=R/f'qa/dense-{look}';dense.mkdir(exist_ok=True);run(['ffmpeg','-v','error','-y','-i',str(V),'-vf','fps=5,scale=270:480','-q:v','4',str(dense/'%04d.jpg')]);files=sorted(dense.glob('*.jpg'));assert len(files)>=math.floor(P['duration']*5);assert all(np.mean(np.array(Image.open(p)))>5 for p in files)
times=P['qaTimes'];sheet=Image.new('RGB',(1080,1530),'#dedbd3');draw=ImageDraw.Draw(sheet);font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',19)
for i,t in enumerate(times):
    im=image(V,t);im.save(R/f'qa/{look}-{t:g}s.jpg',quality=94);px=i%4*270;py=i//4*510;sheet.paste(im.resize((270,480)),(px,py));draw.text((px+9,py+484),f'{t:04.1f}s',font=font,fill='#222')
sheet.save(R/f'outputs/{look}-sheet.jpg',quality=94);frame.save(R/f'outputs/{look}-poster.jpg',quality=94)
cut=R/f'qa/cuts-{look}';cut.mkdir(exist_ok=True)
for s in P['scenes'][1:]:
    for df in [-1,0,1]:image(V,(s['startFrame']+df)/30).save(cut/f'{s["id"]}-{df:+}.jpg',quality=90)
report=dict(ok=True,look=look,width=1080,height=1920,fps='30/1',frames=P['frameCount'],duration=P['duration'],bytes=V.stat().st_size,sha256=hashlib.sha256(V.read_bytes()).hexdigest(),decodedAudioHash=audioHash,sourceSpeech=speech,personColor=dict(meanRGBError=meanError.tolist(),meanAbsoluteRGBError=mae,scope='同一源帧脸部区域与实际编码区域；允许缩放与压缩误差'),cornerPixels=corners,denseFrames=len(files),cutNeighbourFrames=18)
# Fast native preview seeks can return before the compositor presents a frame.
# Verify the actual encoded presenter in both settled corner locations too.
extra=[]
for t,poseFrame in [(14.4,861),(24.4,861)]:
    box=next(q['video']for q in g['poses']if q['frame']==poseFrame)
    ex=round(box['x']+.30*box['width']);ey=round(box['y']+.29*box['height']);ew=round(.4*box['width']);eh=round(.38*box['height'])
    original=image(R/'variants'/look/'assets/master.mp4',t)
    ref=original.transform((ew,eh),Image.Transform.AFFINE,(840/box['width'],0,(ex-box['x'])*840/box['width'],0,840/box['height'],(ey-box['y'])*840/box['height']),Image.Resampling.BICUBIC)
    delta=np.array(image(V,t).crop((ex,ey,ex+ew,ey+eh))).astype(float)-np.array(ref).astype(float)
    color=np.mean(delta,axis=(0,1));err=float(np.abs(delta).mean())
    assert max(abs(color))<5 and err<10,(look,t,'encoded left-corner presenter differs from source',color,err)
    extra.append(dict(time=t,meanRGBError=color.tolist(),meanAbsoluteRGBError=err))
report['extraSettledPresenter']=extra
first=image(V,0);original=image(R/'variants'/look/'assets/master.mp4',0);vbox=g['poses'][0]['video']
fx=round(vbox['x']+.30*vbox['width']);fy=round(vbox['y']+.29*vbox['height']);fw=round(.4*vbox['width']);fh=round(.38*vbox['height'])
firstRef=original.transform((fw,fh),Image.Transform.AFFINE,(840/vbox['width'],0,(fx-vbox['x'])*840/vbox['width'],0,840/vbox['height'],(fy-vbox['y'])*840/vbox['height']),Image.Resampling.BICUBIC)
firstMAE=float(np.abs(np.array(firstRef).astype(float)-np.array(first.crop((fx,fy,fx+fw,fy+fh))).astype(float)).mean());assert firstMAE<10,(look,'first frame presenter missing or changed',firstMAE)
report['firstFramePresenter']=dict(ok=True,meanAbsoluteRGBError=firstMAE)
lastTime=(P['frameCount']-1)/P['fps'];last=image(V,lastTime);lastSource=image(R/'variants'/look/'assets/master.mp4',lastTime)
lastRef=lastSource.transform((fw,fh),Image.Transform.AFFINE,(840/vbox['width'],0,(fx-vbox['x'])*840/vbox['width'],0,840/vbox['height'],(fy-vbox['y'])*840/vbox['height']),Image.Resampling.BICUBIC)
lastMAE=float(np.abs(np.array(lastRef).astype(float)-np.array(last.crop((fx,fy,fx+fw,fy+fh))).astype(float)).mean());assert lastMAE<10,(look,'last frame presenter missing or changed',lastMAE)
report['lastFramePresenter']=dict(ok=True,frame=P['frameCount']-1,meanAbsoluteRGBError=lastMAE)
(R/f'qa/{look}-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(dict(ok=True,look=look,personRGB=meanError.tolist(),mae=mae,dense=len(files)),ensure_ascii=False))
