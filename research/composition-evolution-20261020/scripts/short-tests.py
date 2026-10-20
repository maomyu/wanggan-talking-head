from pathlib import Path
import json,shutil,subprocess,sys,concurrent.futures,re
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';HF=APP/'runtime/node_modules/hyperframes/bin/hyperframes.mjs'
args=sys.argv[1:];revision=''
if '--revision'in args:
 i=args.index('--revision');revision='-'+args[i+1];args=args[:i]+args[i+2:]
keys=args or ['magazine','type-poster','origami','blueprint','clay','precision']
def job(key):
 src=R/'variants'/key;p=R/('short-tests'+revision)/key
 if p.exists()and(p/'outputs/sample.mp4').exists():raise RuntimeError('Actual video already exists; choose a new revision explicitly')
 if not p.exists():shutil.copytree(src,p,ignore=shutil.ignore_patterns('qa','outputs','baseline.html','comparison'))
 (p/'qa').mkdir(exist_ok=True);(p/'outputs').mkdir(exist_ok=True)
 if(p/'baseline.html').exists():shutil.move(p/'baseline.html',p/'qa/previous-baseline-source.txt')
 if(p/'qa/check.log').exists():shutil.copyfile(p/'qa/check.log',p/'qa/check-before-root-fix.log')
 shutil.copyfile(R/'scripts/director.js',p/'assets/director.js')
 h=(p/'index.html').read_text();h=h.replace('data-duration="36.666666666666664"','data-duration="8"');h=re.sub(r'data-origin-frame="[^"]*"','data-origin-frame="461"',h)
 if 'data-origin-frame="461"'not in h:h=h.replace('id="root"','id="root" data-origin-frame="461"',1)
 h=re.sub(r'data-media-start="0(?:\.0+)?"','data-media-start="15.366666666666667"',h)
 # The runtime's source-derived audio element has no explicit source offset.
 h=re.sub(r'(<audio\b[^>]*)(>)',lambda m:m[1]+(' data-media-start="15.366666666666667"'if'data-media-start='not in m[1]else'')+m[2],h)
 (p/'index.html').write_text(h)
 (p/'sample-plan.json').write_text(json.dumps({'fps':30,'frameCount':240,'duration':8,'sourceIn':461,'sourceOut':701,'outputIn':0,'outputOut':240,'captions':'same source captions, clipped and shifted only for this sample','sourceSourceClockSeconds':461/30,'globalVisualClockSeconds':461/30,'scope':'8-second visual seam test, not full-video verification'},indent=2))
 with(p/'qa/check.log').open('w')as log:check=subprocess.run(['node',str(HF),'check','--json',str(p)],stdout=log,stderr=subprocess.STDOUT)
 raw=(p/'qa/check.log').read_text();(p/'qa/check-result.json').write_text(json.dumps({'exitCode':check.returncode,'rawLog':'check.log'}))
 if check.returncode:print(key+' CHECK FAILED',flush=True);return
 with(p/'qa/render.log').open('w')as log:subprocess.run(['node',str(HF),'render',str(p),'--output',str(p/'outputs/sample.mp4'),'--fps','30','--quality','delivery','--workers','3','--video-frame-format','png'],stdout=log,stderr=subprocess.STDOUT,check=True)
 print(key+' 8s actual MP4 encoded',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(job,keys))
