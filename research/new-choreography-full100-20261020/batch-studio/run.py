from pathlib import Path
import json,subprocess,hashlib,concurrent.futures,threading,time,shutil,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head';PY=APP/'runtime/.venv/bin/python';HF=APP/'runtime/node_modules/hyperframes/bin/hyperframes.mjs'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
state=read(R/'qa/batch-state.json');lock=threading.Lock();start=time.time();rows=read(R/'catalogue-full.json')['styles'];selected=set(sys.argv[1:])
def update(key,status,**fields):
    with lock:
        state['jobs'][key].update(status=status,updated=time.time(),**fields);state['verified']=sum(x['status']=='verified'for x in state['jobs'].values());state['status']='complete'if state['verified']==100 else'in-progress';state['elapsedSeconds']=time.time()-start
        tmp=R/'qa/batch-state.tmp';tmp.write_text(json.dumps(state,ensure_ascii=False,indent=2));tmp.replace(R/'qa/batch-state.json')
        active={k:v['status']for k,v in state['jobs'].items()if v['status']in ['checking','rendering','verifying']};failed={k:v.get('error','')for k,v in state['jobs'].items()if v['status']=='failed'}
        (R/'BATCH_STATE.md').write_text('# 100画风新版整片制作\n\n用户已授权：当前同一素材，100种画风全部按新主编排制作完整MP4，同页在线播放对比；人物原色、角落圆窗、字幕上移。\n\n已核验 '+str(state['verified'])+'/100；进行中 '+json.dumps(active,ensure_ascii=False)+'；失败 '+json.dumps(failed,ensure_ascii=False)+'。\n\n运行 batch-studio/run.py，最多2个工作任务，每条渲染3个worker。状态 qa/batch-state.json 是实时依据。原12条新编排视频经源绑定检查后复用并重新核验；另外88条完整渲染。不得借用旧画风布局的视频。已验证跳过，失败记录保留，修改的片子另存版本。\n\n对比页 http://127.0.0.1:58655/review.html#catalog ，IAB tab25。每条完整1100帧、30fps、36.6667秒、1080x1920、21条字幕、一条原声。每条HF动效检查已启用，实际编码解码及原声核验后开放播放。\n\n最终还需全部视频完成、实际编码审看、全100 URL/Range与页面交互验证，以及正式插件登记证据与私有GitHub同步。未完成不得宣称100整片完成。\n')
def command(args,log):
    with log.open('w')as f:result=subprocess.run(args,stdout=f,stderr=subprocess.STDOUT)
    if result.returncode:raise RuntimeError(log.name+' failed '+str(result.returncode))
def work(s):
    key=s['key'];p=R/'variants'/key
    try:
        if (p/'qa/batch-verification.json').exists():
            verified=read(p/'qa/batch-verification.json')
            if sha(p/'outputs/final.mp4')==verified['video']['sha256']:
                update(key,'verified',videoSha256=verified['video']['sha256']);return
        update(key,'checking',started=time.time())
        command(['node',str(HF),'check','--json','--timeout','120000',str(p)],p/'qa/batch-check.log')
        raw=(p/'qa/batch-check.log').read_text();at=raw.find('{\n  "ok"');assert at>=0,'Check JSON missing';check=json.JSONDecoder().raw_decode(raw[at:])[0];assert check['ok']and check['motion']['enabled']and check['motion']['samples']>0
        (p/'qa/batch-check.json').write_text(json.dumps(check,ensure_ascii=False,indent=2))
        files=['index.html','index.motion.json','assets/director.js','scripts/director.js','scripts/build-project.mjs','assets/master.mp4','assets/edited-voice.wav','plans/art-direction.json','plans/layout-plan.json','plans/motion-plan.json','plans/edit-plan.json','plans/choreography.json','timing.json']
        binding={'inputs':{f:sha(p/f)for f in files},'source':'current full composition before encoding / source-bound reuse','captionsPreserved':True};(p/'qa/batch-source-binding.json').write_text(json.dumps(binding,ensure_ascii=False,indent=2))
        target=p/'outputs/final.mp4'
        if not target.exists():
            update(key,'rendering');command(['node',str(HF),'render',str(p),'--output',str(target),'--fps','30','--quality','delivery','--gpu','--workers','3','--video-frame-format','png','--skill','general-video'],p/'qa/batch-render.log')
        update(key,'verifying');command([str(PY),str(R/'batch-studio/verify.py'),key],p/'qa/batch-verify.log')
        report=read(p/'qa/batch-verification.json');update(key,'verified',videoSha256=report['video']['sha256'],audioCorrelation=report['audio']['referenceCorrelation'],motionSamples=report['motionSamples'])
        # Only completed render intermediates owned by this project are removed.
        # Videos, source, dense frames and all validation records stay available.
        for folder in (p/'outputs').glob('work-*'):
            if folder.is_dir():shutil.rmtree(folder)
        print(key+' VERIFIED '+str(state['verified'])+'/100',flush=True)
    except Exception as e:
        update(key,'failed',error=str(e));print(key+' FAILED '+str(e),flush=True)
jobs=[s for s in rows if not selected or s['key']in selected];jobs.sort(key=lambda s:(not(R/'variants'/s['key']/'outputs/final.mp4').exists(),int(s['id'][1:])))
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(work,jobs))
print(json.dumps({'verified':state['verified'],'failed':[k for k,v in state['jobs'].items()if v['status']=='failed'],'elapsedSeconds':time.time()-start}),flush=True)
