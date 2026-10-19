import {shapes,buildStage}from'./material-stage.js';
import asciiGlyphs from './ascii-glyphs.js';
export function makeScreen(ctx,mode){
 let serial=0;const probe=document.createElement('canvas').getContext('2d'),paths=Object.fromEntries(Object.entries(shapes).map(([k,d])=>[k,new Path2D(d)]));
 const inside=(kind,x,y)=>{if(!probe.isPointInPath(paths[kind],x,y))return false;if(kind==='weight'&&Math.hypot((x-150)*.8,y-49)<23)return false;if(kind==='coin'&&Math.hypot(x-150,y-150)<107&&Math.hypot(x-150,y-150)>95)return false;if(kind==='shield'&&((x>85&&x<145&&Math.abs(y-x-45)<10)||(x>135&&x<219&&Math.abs(y+x-325)<10)))return false;return true};
 function object(kind){const id='screen-'+serial++,d=shapes[kind];
  if(mode==='ascii'||mode==='led'){
   let grid='';const step=mode==='ascii'?15:16;
   for(let y=10,row=0;y<294;y+=step,row++){
    let chars='';
    for(let x=10,col=0;x<294;x+=step,col++){
     const yes=inside(kind,x,y);
     if(mode==='ascii'&&yes){const c=['#','+','@','%'][Math.floor((x+y)/35)%4],g=asciiGlyphs.glyphs[c],s=17/asciiGlyphs.unitsPerEm;chars+=`<use href="#ascii-glyph-${c.charCodeAt(0)}" data-character="${c}" transform="translate(${x-g.advance*s/2} ${y+6}) scale(${s} ${-s})"/>`;}
     if(mode==='led')grid+=`<circle data-cell="${row}" cx="${x}" cy="${y}" r="${yes?5.7:2.4}" fill="${yes?'#ffd174':'#605333'}" opacity="${yes?1:.36}"/>`;
    }
    if(mode==='ascii'&&chars)grid+=`<g data-cell="${row}" fill="#c8efac">${chars}</g>`;
   }
   return `<g data-matrix data-rows="20">${grid}</g>`;
  }
  if(mode==='vector'){const inner=kind==='bag'?'M91 82V26Q150 0 209 26V82':kind==='shield'?'M85 143L134 191L219 96':kind==='coin'?'M245 150A95 95 0 1 1 55 150A95 95 0 1 1 245 150M110 108H190M150 108V204M110 204H190':'M118 52A32 26 0 1 1 182 52A32 26 0 1 1 118 52';return `<defs><filter id="${id}-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter></defs><path d="${d}" fill="none" stroke="#69e2a5" stroke-width="8" filter="url(#${id}-glow)" opacity=".45"/><path data-beam-path d="${d}" fill="none" stroke="#b8ffd4" stroke-width="3"/><path d="${inner}" fill="none" stroke="#b8ffd4" stroke-width="3.5"/><circle data-beam-tip r="4.5" fill="#effff3"/>`}
  return `<path d="M31 71H128L149 92H270V267H31Z" fill="#e0bd5f" stroke="#252625" stroke-width="6"/><path d="M31 113H271V267H31Z" fill="#f1d984"/><path d="M31 113H271" stroke="#fff4c3" stroke-width="8"/><path d="${d}" transform="translate(81 133) scale(.45)" fill="${kind==='coin'?'#386ca6':kind==='shield'?'#457950':kind==='weight'?'#9d5849':'#6e6a83'}" stroke="#343536" stroke-width="6"/><rect data-desktop-select x="16" y="27" width="274" height="266" fill="none" stroke="#244b9c" stroke-width="5" stroke-dasharray="9 7"/>`;
 }
 if(mode==='desktop')ctx.architecture.innerHTML='<div class="desktop-bar"><span>判断 · 三项底线</span><span class="window-controls">_　[]　x</span></div>';
 if(mode==='ascii')ctx.architecture.innerHTML='<div class="terminal-bar">选择 / 后果</div><span class="terminal-cursor"></span>';
 if(mode==='vector')ctx.architecture.innerHTML='<div class="scope-ticks"></div>';
 const decorate=mode==='ascii'?Object.entries(asciiGlyphs.glyphs).map(([c,g])=>`<path id="ascii-glyph-${c.charCodeAt(0)}" d="${g.path}"/>`).join(''):'';
 const stage=buildStage({...ctx,object,decorate}),matrices=[...ctx.container.querySelectorAll('[data-matrix]')],beams=[...ctx.container.querySelectorAll('[data-beam-path]')].map(el=>({el,n:el.getTotalLength(),tip:el.parentNode.querySelector('[data-beam-tip]')})),selections=[...ctx.container.querySelectorAll('[data-desktop-select]')];
 if(mode==='desktop')ctx.container.querySelector('svg').insertAdjacentHTML('beforeend','<g data-desktop-pointer><circle data-desktop-click fill="none" stroke="#244b9c" stroke-width="4"/><path d="M0 0L3 43L14 31L24 49L32 44L23 27L40 27Z" fill="#fffdf4" stroke="#172b32" stroke-width="3"/></g>');
 const pointer=ctx.container.querySelector('[data-desktop-pointer]');
 return{render(t,id,age,frame){stage.render(t,id,age,frame);
  for(const m of matrices){const piece=m.closest('[data-piece]'),start=Number(piece.dataset.at)||ctx.P.scenes.find(s=>s.id===piece.closest('[data-scene]').dataset.scene).startFrame+10,u=mode==='led'?ctx.out(Math.floor((frame-start)/4)*4/18):Number(piece.dataset.progress),rows=Math.floor(u*20);if(mode==='led')piece.style.opacity=rows>0?'1':'0';for(const c of m.children)c.style.visibility=Number(c.dataset.cell)<rows?'visible':'hidden';}
  if(mode==='ascii')ctx.container.querySelector('[data-risk-coin]').style.opacity=String(1-ctx.out((frame-ctx.P.triggers.risk)/12));
  for(const b of beams){const u=Number(b.el.closest('[data-piece]').dataset.progress),len=b.n*ctx.out(u);b.el.style.strokeDasharray=`${len} ${b.n}`;const p=b.el.getPointAtLength((t*.32%1)*len);b.tip.setAttribute('cx',p.x);b.tip.setAttribute('cy',p.y);b.tip.style.opacity=u>.7?'1':'0';}
  for(const el of selections){const piece=el.closest('[data-piece]'),kind=piece.dataset.kind;el.style.opacity=(id==='spend'&&kind==='shield'&&frame>=ctx.P.triggers.want||id==='risk'&&kind==='shield'||id==='debt')?'1':'0';}
  if(pointer){const active=id==='spend',u=ctx.out((frame-ctx.P.triggers.want+18)/18),pulse=ctx.clamp((frame-ctx.P.triggers.want)/13),ring=pointer.querySelector('circle');pointer.style.opacity=active?'1':'0';pointer.setAttribute('transform',`translate(${890+(758-890)*u} ${620+(324-620)*u})`);ring.setAttribute('r',8+30*pulse);ring.style.opacity=frame>=ctx.P.triggers.want?String(1-pulse):'0';const bar=ctx.architecture.querySelector('.desktop-bar span');bar.textContent=({chain:'选择的后果',overview:'三项财经底线',spend:'想要与需要',risk:'先守住本金',debt:'减轻负债'})[id]||'判断 / 三项底线';}
  const cursor=ctx.architecture.querySelector('.terminal-cursor');if(cursor)cursor.style.opacity=Math.floor(t*2)%2?'1':'.2';
 }};
}
