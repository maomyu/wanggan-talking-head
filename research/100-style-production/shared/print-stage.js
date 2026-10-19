import {shapes,buildStage} from './material-stage.js';
export function makePrint(ctx,mode){
 let serial=0;
 const paper=mode==='cyanotype'?'#f5f1df':'#f5ecd8',ink=mode==='woodcut'?'#192820':'#244282';
 function detail(kind,color,width){return kind==='bag'?`<path d="M91 82V26Q150 0 209 26V82M62 112L83 241H237" fill="none" stroke="${color}" stroke-width="${width}"/>`:kind==='coin'?`<circle cx="150" cy="150" r="96" fill="none" stroke="${color}" stroke-width="${width}"/><path d="M111 106H189M150 106V205M111 205H189" fill="none" stroke="${color}" stroke-width="${width}"/>`:kind==='shield'?`<path d="M85 143L134 191L219 96" fill="none" stroke="${color}" stroke-width="${width*2}"/>`:`<ellipse cx="150" cy="52" rx="32" ry="26" fill="${color}"/><path d="M66 119L40 245H260" fill="none" stroke="${color}" stroke-width="${width}"/>`}
 function object(kind){const d=shapes[kind],id='print-'+serial++;
  if(mode==='woodcut'){
   let cuts='';for(let i=0;i<23;i++){const x=(i*37)%302,y=30+(i*71)%245,w=4+i%4;cuts+=`M${x} ${y}l${w} -4l${17+i%24} ${38+i%19}l-5 -2Z `}
   return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${ink}"/><g clip-path="url(#${id})"><path d="${cuts}" fill="${paper}"/><path d="M-10 220L310 68M-10 251L310 110" stroke="${paper}" stroke-width="5" fill="none"/></g>${detail(kind,paper,8)}<path d="${d}" stroke="${ink}" stroke-width="6" fill="none"/>${kind==='bag'?`<path d="M91 58V26Q150 0 209 26V58" fill="none" stroke="${ink}" stroke-width="9"/>`:''}`;
  }
  if(mode==='risograph'){
   return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath><pattern id="${id}-grain" width="11" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r="1.2" fill="${paper}"/><circle cx="8" cy="9" r=".8" fill="${paper}"/></pattern><clipPath id="${id}-plate"><path d="M150 0H300V300H150Z"/></clipPath><clipPath id="${id}-cyan"><path d="M0 0H205V300H0Z"/></clipPath></defs><g clip-path="url(#${id}-cyan)"><path d="${d}" fill="#2c9ca8" opacity=".86" transform="translate(-5 0)"/></g><g data-plate style="mix-blend-mode:multiply"><g clip-path="url(#${id}-plate)"><path d="${d}" fill="#df526b" opacity=".87" transform="translate(5 4)"/></g></g><g clip-path="url(#${id})"><rect width="300" height="300" fill="url(#${id}-grain)"/></g>${detail(kind,ink,6)}<path d="${d}" stroke="${ink}" stroke-width="2.5" fill="none"/>`;
  }
  return `<defs><filter id="${id}-edge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.3"/></filter><clipPath id="${id}"><path d="${d}"/></clipPath><pattern id="${id}-fibres" width="17" height="21" patternUnits="userSpaceOnUse"><path d="M1 4L5 3M9 16L14 17M12 7L16 6" stroke="#7197b3" stroke-width="1" opacity=".34"/></pattern></defs><path d="${d}" fill="${paper}" filter="url(#${id}-edge)" opacity=".7"/><path d="${d}" fill="${paper}" opacity=".9"/><g clip-path="url(#${id})"><path d="M-30 290Q150 180 315 35M-20 208Q155 151 310 75" fill="none" stroke="#608eb0" stroke-width="2" opacity=".48"/><rect width="300" height="300" fill="url(#${id}-fibres)"/></g>${detail(kind,'#3b6b98',4)}`;
 }
 if(mode==='cyanotype')ctx.architecture.innerHTML='<svg width="100%" height="100%" viewBox="0 0 1000 780" preserveAspectRatio="none"><path d="M16 13L995 22L982 758L7 771L21 509L8 290Z" fill="#285f94"/><path d="M32 25L980 31L968 745L23 756Z" fill="#1d5087" opacity=".66"/></svg>';
 const stage=buildStage({...ctx,object});const plates=[...ctx.container.querySelectorAll('[data-plate]')];
 return {render(t,id,age,frame){stage.render(t,id,age,frame);for(const el of plates){const u=Number(el.closest('[data-piece]').dataset.progress),v=ctx.out((u-.25)/.75);el.setAttribute('transform',`translate(${24*(1-v)} ${-17*(1-v)})`);el.style.opacity=v;}}};
}
