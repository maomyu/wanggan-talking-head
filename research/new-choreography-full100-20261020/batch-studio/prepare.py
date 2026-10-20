from pathlib import Path
import json,hashlib,uuid,shutil,re
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
OLD=R.parent/'test/编排差异化研究_20261020/full-cycle-v2'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2))
catalogue=read(APP/'style-library/catalog.json');mapping=read(APP/'choreography-library/style-map.json')['styles'];systems=read(APP/'choreography-library/systems.json')['systems'];versions=read(APP/'choreography-library/source-versions.json');rows=[]
prior=read(OLD/'qa/final-verification.json')if (OLD/'qa/final-verification.json').exists()else{'films':[]};imports={f['key']:f for f in prior['films']}
canonical=None
for s in catalogue['styles']:
    key=s['key'];p=R/'variants'/key;v=versions[key];m=next(m for m in mapping if m['key']==key);sy=next(c for c in systems if c['id']==m['primarySystem'])
    assert sha(p/'assets/master.mp4')==v['protected']['assets/master.mp4']
    assert sha(p/'assets/edited-voice.wav')==v['protected']['assets/edited-voice.wav']
    assert sha(p/'assets/director.js')==sha(p/'scripts/director.js')==v['directorSha256']
    assert sha(p/'plans/edit-plan.json')==v['protected']['plans/edit-plan.json']
    t=read(p/'timing.json');caps=[{k:c[k]for k in ['text','startFrame','endFrame']}for c in t['captions']]
    if canonical is None:canonical=caps
    assert caps==canonical and len(caps)==21
    save(p/'index.motion.json',{'duration':1100/30,'assertions':[{'kind':'appearsBy','selector':'#d-heading','bySec':.1},{'kind':'staysInFrame','selector':'#person-mask'},{'kind':'staysInFrame','selector':'#captions'}]})
    provenance={'kind':'new-formal-render','sourceBinding':v}
    if (p/'outputs/final.mp4').exists():
        delivery=read(p/'qa/delivery.json');assert sha(p/'outputs/final.mp4')==delivery['video']['sha256'];assert key=='magazine'
        provenance={'kind':'existing-current-formal-composition','delivery':delivery,'sourceBinding':v}
    elif key in imports:
        f=imports[key];original=OLD/'variants'/key;assert sha(original/'outputs/final.mp4')==f['videoSha256']
        assert sha(original/'assets/director.js')==v['directorSha256']
        norm=lambda x:re.sub(r' data-hf-id="[^"]+"','',x)
        assert norm((original/'index.html').read_text())==norm((p/'index.html').read_text()),key+' incompatible imported HTML'
        shutil.copy2(original/'outputs/final.mp4',p/'outputs/final.mp4')
        provenance={'kind':'source-bound-existing-new-composition','importedVideoSha256':f['videoSha256'],'sourceBinding':f['sourceBinding'],'priorActualVerification':read(original/'qa/film-verification.json')}
    save(p/'qa/batch-provenance.json',provenance)
    rows.append({**{k:s[k]for k in ['id','key','name','family','familyKey','profiles','visualMechanism']},'composition':{k:sy[k]for k in ['id','key','name','decision','motionVocabulary','editing']},'video':'variants/'+key+'/outputs/final.mp4','poster':'variants/'+key+'/outputs/poster.jpg','status':'awaiting-fresh-verification' if (p/'outputs/final.mp4').exists()else'queued'})
save(R/'catalogue-full.json',{'version':'100-new-choreography-full-films','fps':30,'frameCount':1100,'duration':1100/30,'styles':sorted(rows,key=lambda s:int(s['id'][1:])),'principles':['人物原色','角落圆窗','字幕上移'],'sourceSha256':versions['magazine']['protected']['assets/master.mp4']})
save(R/'project.json',{'id':str(uuid.uuid4()),'name':'100画风新编排完整视频对比','scope':'collection','renderer':'gallery-only','status':'batch-in-progress'})
save(R/'qa/batch-state.json',{'status':'prepared','total':100,'verified':0,'reusedSourceBoundVideos':len(imports),'jobs':{s['key']:{'status':s['status']}for s in rows}})
print(json.dumps({'prepared':len(rows),'sourceBoundExistingVideos':len(imports),'newRendersRequired':100-len(imports)},ensure_ascii=False))
