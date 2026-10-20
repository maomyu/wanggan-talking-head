from pathlib import Path
import hashlib,json,subprocess,io
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
def frame(file,n):
    data=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(file),'-vf',f'select=eq(n\\,{n})','-frames:v','1','-f','image2pipe','-c:v','png','-threads','2','-'])
    return Image.open(io.BytesIO(data)).convert('RGB')
results=[];out=root/'qa/person-pixels';out.mkdir(exist_ok=True)
for f in [0,120,300,420,600]:
    encoded=frame(root/'outputs/final.mp4',f)
    source=frame(root/'assets/master.mp4',f+461)
    x,y,w=(716,1255,300) if f<468 else (250,470,580)
    subject=encoded.crop((x,y,x+w,y+w));ref=source.resize((w,w),Image.Resampling.BILINEAR)
    a=np.array(subject).astype(float);b=np.array(ref).astype(float)
    yy,xx=np.ogrid[:w,:w];inner=(xx-w/2)**2+(yy-w/2)**2<(w*.38)**2
    mae=float(np.abs(a-b)[inner].mean());bias=(a-b)[inner].mean(axis=0).tolist()
    corners=[]
    for px,py in [(4,4),(w-16,4),(4,w-16),(w-16,w-16)]:
        patch=a[py:py+12,px:px+12];corners.append(float(np.abs(patch-np.array([246,247,244])).mean()))
    results.append({'outputFrame':f,'sourceFrame':f+461,'box':[x,y,w,w],'innerRGBMeanAbsoluteError':round(mae,4),'meanRGBBias':[round(z,4) for z in bias],'circleCornerBackgroundError':[round(z,4) for z in corners]})
    if f==300:
        source.save(out/'source-frame-761.png');subject.save(out/'encoded-circle-frame-300.png')
report={'videoSha256':hashlib.sha256((root/'outputs/final.mp4').read_bytes()).hexdigest(),'samples':results,'method':'原片同帧等比缩小，与编码内圆窗中心区域比较RGB；正方形四角检验是否露出人像。避开圆边与压缩最强区；不宣称逐像素完全相同。','pass':all(r['innerRGBMeanAbsoluteError']<12 and max(r['circleCornerBackgroundError'])<8 for r in results)}
(root/'qa/person-color-and-circle.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
if not report['pass']:raise SystemExit(1)
