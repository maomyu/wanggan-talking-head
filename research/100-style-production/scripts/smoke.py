from pathlib import Path
import json,shutil,sys,re,subprocess,os
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';HF=APP/'runtime/node_modules/hyperframes/bin/hyperframes.mjs'
start=float(os.environ.get('WG_SMOKE_START','4.5'));origin=round(start*30)
for key in sys.argv[1:]:
 src=R/'variants'/key;dst=R/os.environ.get('WG_SMOKE_REV','smoke')/key
 if dst.exists():raise SystemExit('Smoke exists; keep evidence and use a new revision: '+str(dst))
 shutil.copytree(src,dst,ignore=shutil.ignore_patterns('outputs','qa','.hyperframes'));(dst/'outputs').mkdir();(dst/'qa').mkdir()
 html=(src/'index.html').read_text();html=re.sub(r'data-duration="[^"]+"','data-duration="4"',html);html=html.replace('data-composition-id="main"',f'data-composition-id="main" data-origin-frame="{origin}"');html=html.replace('data-media-start="0"',f'data-media-start="{start:g}"');(dst/'index.html').write_text(html)
 with(dst/'qa/render.log').open('w')as log:subprocess.run(['node',str(HF),'render',str(dst),'--output',str(dst/'outputs/smoke.mp4'),'--fps','30','--quality','delivery','--gpu','--workers','2','--video-frame-format','png','--skill','general-video'],stdout=log,stderr=subprocess.STDOUT,check=True)
 media=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(dst/'outputs/smoke.mp4')]))
 v=next(s for s in media['streams']if s['codec_type']=='video');assert int(v['nb_read_frames'])==120 and v['width']==1080 and v['height']==1920 and abs(float(media['format']['duration'])-4)<.03
 subprocess.run(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-y','-i',str(dst/'outputs/smoke.mp4'),'-vf','fps=2,scale=270:480,tile=4x2','-frames:v','1','-update','1',str(dst/'outputs/contact.jpg')],check=True)
 (dst/'qa/smoke.json').write_text(json.dumps(dict(ok=True,key=key,sourceWindow=[start,start+4],frames=120,width=1080,height=1920,actualEncoded=True,scope='指定4秒窗口的真实编码，非整片验证'),ensure_ascii=False,indent=2));print(key+' smoke encoded and checked',flush=True)
