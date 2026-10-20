from pathlib import Path
import json,sys
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];cat=json.loads((R/'catalogue-full.json').read_text());state=json.loads((R/'qa/batch-state.json').read_text());dest=R/'qa/author-sheets';dest.mkdir(exist_ok=True)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Unicode.ttf',14);indices=[0,240,420,567,732,879,1099];requested=set(sys.argv[1:])
for group in range(10):
    rows=cat['styles'][group*10:(group+1)*10];ready=[s for s in rows if state['jobs'][s['key']]['status']=='verified']
    if not ready or requested and str(group+1)not in requested:continue
    w,h,gap=144,256,7;out=Image.new('RGB',(7*(w+gap)+gap,len(ready)*(h+45+gap)+gap),'#ece9df');d=ImageDraw.Draw(out)
    for i,s in enumerate(ready):
        y=gap+i*(h+45+gap);d.text((gap,y),s['id']+' '+s['name']+' / '+s['composition']['name'],fill='#173423',font=font)
        for j,f in enumerate(indices):
            x=gap+j*(w+gap);im=Image.open(R/'variants'/s['key']/'qa/batch-decoded'/f'f{f}.jpg');out.paste(im.resize((w,h)),(x,y+22));d.text((x,y+22+h+2),f'{f/30:.2f}s',fill='#52664d',font=font)
    out.save(dest/f'group-{group+1:02d}.jpg',quality=93)
    print(str(dest/f'group-{group+1:02d}.jpg')+' '+str(len(ready))+' styles')
