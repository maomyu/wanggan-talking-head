"""Check only the revised, not-yet-rendered sources; never mark a film verified."""
from pathlib import Path
import json,hashlib,subprocess,shutil,sys
R=Path(__file__).resolve().parents[1];APP=Path.home()/'plugins/wanggan-talking-head'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
keys=list(read(R/'variants/minimal/qa/batch-source-binding.json')['inputs'])
overrides=read(R/'qa/director-overrides.json')['styles']
for key in sys.argv[1:]:
    p=R/'variants'/key;assert key in overrides and not(p/'outputs/final.mp4').exists()
    assert sha(p/'scripts/director.js')==overrides[key]['newDirectorSha256']
    before={file:sha(p/file)for file in keys};log=p/'qa/batch-check.log';old=p/'qa/batch-check-before-visibility-fix.log'
    if log.exists()and not old.exists():shutil.copy2(log,old)
    with log.open('w')as f:
        subprocess.run(['node',str(R/'batch-studio/check-with-budget.mjs'),str(APP/'runtime/node_modules/hyperframes/bin/hyperframes.mjs'),str(p),'--json','--timeout','120000'],stdout=f,stderr=subprocess.STDOUT,check=True)
    raw=log.read_text();at=raw.find('{\n  "ok"');assert at>=0
    check=json.JSONDecoder().raw_decode(raw[at:])[0];assert check['ok']and check['motion']['enabled']and check['motion']['samples']==300
    assert before=={file:sha(p/file)for file in keys},'Source changed during check'
    (p/'qa/batch-check.json').write_text(json.dumps(check,ensure_ascii=False,indent=2))
    budget=read(p/'qa/check-budget.json');budget['reportSha256']=sha(p/'qa/batch-check.json');(p/'qa/check-budget.json').write_text(json.dumps(budget,indent=2))
    (p/'qa/batch-source-binding.json').write_text(json.dumps({'inputs':before,'source':'revised unchanged source passed full pinned checker before encoding','captionsPreserved':True},indent=2))
    (p/'qa/visibility-regression-check.json').write_text(json.dumps({'sourceFixed':True,'fullCheckPassed':True,'motionSamples':300,'videoRendered':False,'directorSha256':before['scripts/director.js']},indent=2))
    print(key+' full revised-source check PASSED300; video still pending',flush=True)
