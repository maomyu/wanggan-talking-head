from pathlib import Path
import json,shutil,subprocess,sys
R=Path(__file__).resolve().parents[1];P=Path.home()/'plugins/wanggan-talking-head';D=P/'research/100-style-production'
info=json.loads(subprocess.check_output(['gh','repo','view','maomyu/wanggan-talking-head','--json','isPrivate,url']))
if not info['isPrivate']:raise SystemExit('Stop: destination must remain private')
for f in(R/'shared').iterdir():
 if f.is_dir():shutil.copytree(f,D/'shared'/f.name,dirs_exist_ok=True)
 else:shutil.copy2(f,D/'shared'/f.name)
for name in ['BRIEF.md','progress.json']:shutil.copy2(R/name,D/name)
if(R/'references.json').exists():shutil.copy2(R/'references.json',D/'references.json')
if(R/'qa/ledger.md').exists():shutil.copy2(R/'qa/ledger.md',D/'evidence/ledger.md')
if(R/'qa/author-review.json').exists():shutil.copy2(R/'qa/author-review.json',D/'evidence/author-review.json')
for f in(R/'qa').glob('*-verification.json'):shutil.copy2(f,D/'evidence'/f.name)
if(R/'qa/design-qa.json').exists():shutil.copy2(R/'qa/design-qa.json',D/'evidence/design-qa.json')
for folder in ['smoke','smoke-v2','smoke-v3','smoke-risk-debt']:
 if not(R/folder).exists():continue
 for case in(R/folder).iterdir():
  f=case/'qa/smoke.json'
  if f.exists():shutil.copy2(f,D/'evidence'/f'{case.name}-{folder}.json')
subprocess.run(['node',str(P/'scripts/seal.mjs')],check=True);subprocess.run(['node',str(P/'scripts/validate-package.mjs')],check=True,stdout=subprocess.DEVNULL)
subprocess.run(['git','-C',str(P),'add','--','.'],check=True)
dirty=subprocess.check_output(['git','-C',str(P),'diff','--cached','--name-only'],text=True).strip()
if dirty:
 message=' '.join(sys.argv[1:])or'feat: advance hundred-style production with verified evidence'
 result=subprocess.check_output(['git','-C',str(P),'commit','-m',message],text=True);print(result.splitlines()[0])
 subprocess.run(['git','-C',str(P),'push','origin','main'],check=True)
local=subprocess.check_output(['git','-C',str(P),'rev-parse','HEAD'],text=True).strip();remote=subprocess.check_output(['git','-C',str(P),'ls-remote','origin','refs/heads/main'],text=True).split()[0];assert local==remote
(R/'qa/github-sync.json').write_text(json.dumps(dict(private=True,url=info['url'],head=local,remoteMatches=True),ensure_ascii=False,indent=2));print('Private repository up to date: '+local[:8],flush=True)
