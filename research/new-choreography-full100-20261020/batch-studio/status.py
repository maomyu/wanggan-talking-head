from pathlib import Path
import json,re,shutil
R=Path(__file__).resolve().parents[1]
s=json.loads((R/'qa/batch-state.json').read_text())
review=json.loads((R/'qa/batch-author-review.json').read_text())
seen={x['key']for x in review['viewed']};active={}
for key,job in s['jobs'].items():
    if job['status']in ['queued','verified']:continue
    row={'stage':job['status']};log=R/'variants'/key/'qa/batch-render.log'
    if log.exists()and job['status']in ['rendering','verifying']:
        events=re.findall(r'@hf-progress (\{[^\n]+\})',log.read_text())
        if events:row.update(json.loads(events[-1]))
    if job.get('error'):row['error']=job['error']
    active[key]=row
print(json.dumps({'verified':s['verified'],'total':s['total'],'authorViewed':len(seen),'readyForReview':[k for k,v in s['jobs'].items()if v['status']=='verified'and k not in seen],'active':active,'freeGiB':round(shutil.disk_usage(R).free/1024**3,1)},ensure_ascii=False))
