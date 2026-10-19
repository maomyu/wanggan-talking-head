from pathlib import Path
import json, hashlib, subprocess, io, sys
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1]
geometry=json.loads((R/'qa/design-qa.json').read_text())['results']
plan=json.loads((R/'edit-plan.json').read_text())
def frame(p,n):
    data=subprocess.check_output(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-i',str(p),'-vf',f'select=eq(n\\,{n})','-fps_mode','vfr','-frames:v','1','-f','image2pipe','-vcodec','png','pipe:1'],stderr=subprocess.DEVNULL)
    return Image.open(io.BytesIO(data)).convert('RGB')
for key in sys.argv[1:]:
    p=R/'variants'/key;v=p/'outputs/final.mp4';report_path=R/'qa'/f'{key}-verification.json';report=json.loads(report_path.read_text())
    assert report['ok'] and hashlib.sha256(v.read_bytes()).hexdigest()==report['sha256']
    if report.get('lastFramePresenter',{}).get('ok'):continue
    n=plan['frameCount']-1;actual=frame(v,n);source=frame(p/'assets/master.mp4',n)
    b=next(s for s in geometry if s['look']==key)['poses'][0]['video']
    x=round(b['x']+.30*b['width']);y=round(b['y']+.29*b['height']);w=round(.4*b['width']);h=round(.38*b['height'])
    expected=source.transform((w,h),Image.Transform.AFFINE,(840/b['width'],0,(x-b['x'])*840/b['width'],0,840/b['height'],(y-b['y'])*840/b['height']),Image.Resampling.BICUBIC)
    mae=float(np.abs(np.array(expected).astype(float)-np.array(actual.crop((x,y,x+w,y+h))).astype(float)).mean())
    assert mae<10,(key,'final presenter does not match source',mae)
    report['lastFramePresenter']=dict(ok=True,frame=n,meanAbsoluteRGBError=mae,scope='supplement to exact existing encode proof; actual final frame compared with source at the settled portrait base')
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (R/'qa/end-frames').mkdir(exist_ok=True);actual.save(R/'qa/end-frames'/f'{key}.png')
    print(key+' actual final frame '+str(n)+' passed',flush=True)
