from pathlib import Path
import json,subprocess,hashlib,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';key=sys.argv[1];p=R/'variants'/key
def read(f):return json.loads(f.read_text())
def sha(f):return hashlib.sha256(f.read_bytes()).hexdigest()
def run(args):return subprocess.check_output(args,stderr=subprocess.DEVNULL)
movie=p/'outputs/final.mp4';before=read(p/'qa/batch-source-binding.json');check=read(p/'qa/batch-check.json')
assert check['ok'] and check['motion']['enabled'] and check['motion']['samples']>0
for file,h in before['inputs'].items():assert sha(p/file)==h,key+' changed '+file
subprocess.run([str(APP/'runtime/.venv/bin/python'),str(APP/'runtime/scripts/media.py'),'verify',str(p)],check=True)
report=read(p/'qa/delivery.json');probe=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
assert len([s for s in probe['streams']if s['codec_type']=='audio'])==1
def pcm(f):return np.frombuffer(run(['ffmpeg','-threads','2','-v','error','-i',str(f),'-vn','-ac','1','-ar','48000','-f','f32le','pipe:1']),dtype='<f4').astype(np.float64)
a=pcm(p/'assets/edited-voice.wav');b=pcm(movie);n=min(len(a),len(b));a=a[:n];b=b[:n]
def corr(a,b):return float(np.dot(a,b)/np.sqrt(np.dot(a,a)*np.dot(b,b)))
windows=[corr(a[i:i+48000],b[i:i+48000])for i in range(0,n-48000+1,48000)];assert min(windows)>.97
assert report['audio']['offsetSamples']==0 and report['audio']['droppedVoiceWindows']==0
frames=[0,148,149,150,172,240,387,388,389,420,460,461,462,485,567,615,616,617,640,732,855,856,857,879,897,898,899,922,1071,1099]
dest=p/'qa/batch-decoded';dest.mkdir(exist_ok=True)
selected='+'.join(f'eq(n\\,{i})'for i in frames)
subprocess.run(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-y','-i',str(movie),'-vf','select='+selected,'-fps_mode','vfr','-q:v','2',str(dest/'selected-%03d.jpg')],check=True)
for i,f in enumerate(frames,1):(dest/f'selected-{i:03d}.jpg').replace(dest/f'f{f}.jpg')
Image.open(dest/'f567.jpg').resize((360,640)).save(p/'outputs/compare-poster.jpg',quality=88)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Unicode.ttf',16)
def sheet(indices,name,width,cols):
    height=round(width*16/9);gap=8;out=Image.new('RGB',(cols*(width+gap)+gap,((len(indices)+cols-1)//cols)*(height+30+gap)+gap),'#ece9e0');d=ImageDraw.Draw(out)
    for j,f in enumerate(indices):
        x=gap+(j%cols)*(width+gap);y=gap+(j//cols)*(height+30+gap);out.paste(Image.open(dest/f'f{f}.jpg').resize((width,height)),(x,y));d.text((x,y+height+3),f'{f/30:.2f}s / f{f}',font=font,fill='#15221c')
    out.save(p/'qa'/name,quality=90)
sheet([0,240,420,567,732,879,1099],'batch-story.jpg',216,7);sheet(frames,'batch-cuts.jpg',162,10)
result={'key':key,'status':'verified','source':before,'video':report['video'],'audio':{**report['audio'],'oneSecondCorrelations':windows},'captionCount':len(read(p/'timing.json')['captions']),'selectedFrames':frames,'dense5fpsFrames':report['dense5fpsFrames'],'motionSamples':check['motion']['samples'],'provenance':read(p/'qa/batch-provenance.json')['kind'],'limits':'Measured checks and author sample review. No independent blind review; native strict composite seek differences remain separately documented.'}
if (p/'qa/check-budget.json').exists():
    budget=read(p/'qa/check-budget.json')
    if budget.get('reportSha256')==sha(p/'qa/batch-check.json'):
        assert budget['applications']==1 and budget['installedModuleUnchanged'] and not budget['rulesChanged'] and not budget['samplesReduced'];result['checkBudget']=budget
(p/'qa/batch-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
project=read(p/'project.json');project['status']='verified';(p/'project.json').write_text(json.dumps(project,ensure_ascii=False,indent=2))
print(json.dumps({'key':key,'verified':True,'frames':report['video']['frames'],'audioCorrelation':report['audio']['referenceCorrelation'],'motionSamples':check['motion']['samples']}),flush=True)
