from pathlib import Path
import sys
from PIL import Image,ImageDraw,ImageFont

R=Path(__file__).resolve().parents[1]
font=ImageFont.load_default(size=18)
for key in sys.argv[1:]:
 p=R/'variants'/key/'qa/design-frames';sheet=Image.new('RGB',(1080,1020),'#dedbd3');d=ImageDraw.Draw(sheet)
 for i,t in enumerate([0,6.9,11.5,14.4,18.9,24.4,29.3,35.6]):
  f=p/('frame-'+str(round(t*30)).zfill(4)+'.png');im=Image.open(f).convert('RGB');assert im.size==(1080,1920);x=i%4*270;y=i//4*510;sheet.paste(im.resize((270,480)),(x,y));d.text((x+8,y+484),f'{t:04.1f}s',fill='#222',font=font)
 sheet.save(R/'qa'/f'{key}-preview-sheet.jpg',quality=94)
 print(key+' native contact created')
