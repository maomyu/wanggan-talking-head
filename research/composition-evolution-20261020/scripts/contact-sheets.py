from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];cat=json.loads((R/'catalogue.json').read_text());dest=R/'qa/contact';dest.mkdir(exist_ok=True)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Unicode.ttf',24)
def sheet(items,name,cols=5,w=300):
 h=round(w*16/9);gap=16;label=64;rows=(len(items)+cols-1)//cols;im=Image.new('RGB',(gap+(w+gap)*cols,gap+(h+label+gap)*rows),'#eeeFEB');d=ImageDraw.Draw(im)
 for i,(path,title,subtitle)in enumerate(items):
  if not path.exists():raise FileNotFoundError(path)
  x=gap+(i%cols)*(w+gap);y=gap+(i//cols)*(h+label+gap);im.paste(Image.open(path).convert('RGB').resize((w,h)),(x,y));d.text((x,y+h+8),title,font=font,fill='#18211c');d.text((x,y+h+36),subtitle,font=font,fill='#57614f')
 im.save(dest/name,quality=94);print(name)
reps=['minimal','magazine','type-poster','comic','origami','blueprint','film','clay','archive-dossier','precision','ink','sci-fi-wireframe']
if all((R/'variants'/k/'qa/stills/f567.jpg').exists()for k in reps):
 sheet([(R/'variants'/k/'qa/stills/f567.jpg',next(s['name']for s in cat['styles']if s['key']==k),next(s['choreography']['name']for s in cat['styles']if s['key']==k))for k in reps],'12-directions.jpg',4,320)
for i in range(0,100,10):
 rows=cat['styles'][i:i+10]
 if all((R/'variants'/s['key']/'qa/stills/f567.jpg').exists()for s in rows):sheet([(R/'variants'/s['key']/'qa/stills/f567.jpg',s['id']+' '+s['name'],s['choreography']['name'])for s in rows],f"{i+1:03d}-{i+10:03d}.jpg")
if (R/'qa/short-video-verification.json').exists():
 vr=json.loads((R/'qa/short-video-verification.json').read_text())
 for s in vr:sheet([(R/('short-tests-'+s['revision'])/s['key']/'qa/decoded'/f'f{f}.jpg',s['key'],f'frame {f} /240')for f in s['decodedFrames']],s['key']+'-encoded.jpg',5,240)
if (R/'qa/same-art/proof.json').exists():
 same=json.loads((R/'qa/same-art/proof.json').read_text())['rows'];wanted=['editorial','type','stack','stage','interface','radial'];same=[s for s in same if s['key']in wanted]
 sheet([(R/s['path'],s['name'],'相同杂志画风 / 18.9s')for s in same],'same-art-six.jpg',3,320)
