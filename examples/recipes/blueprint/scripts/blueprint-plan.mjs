// Continuous engineering plan: the camera visits existing stations; it never swaps cards.
export function createBlueprintPlan(mount,C){
 const NS='http://www.w3.org/2000/svg',clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x),u=(f,a,b)=>ease(clamp((f-a)/(b-a))),mix=(a,b,t)=>a+(b-a)*t;
 const svg=document.createElementNS(NS,'svg');svg.id='engineering-plan';svg.setAttribute('viewBox','0 0 980 1030');
 const headphones='<path d="M-65 20V-30C-65-125 65-125 65-30V20M-65-5H-40V70H-65Q-80 70-80 50V15Q-80-5-65-5ZM65-5H40V70H65Q80 70 80 50V15Q80-5 65-5Z"/>';
 const capital=Array.from({length:8},(_,i)=>`<rect x="${-82+(i%4)*45}" y="${-36+Math.floor(i/4)*48}" width="31" height="31"/>`).join('');
 const debts=Array.from({length:6},(_,i)=>`<path id="ep-debt-${i}" d="M-82 ${-70+i*27}H82v15H-82Z"/>`).join('');
 svg.innerHTML=`<defs><pattern id="ep-hatch" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M-4 4L4-4M0 16L16 0M12 20L20 12"/></pattern><clipPath id="ep-scan-clip"><rect id="ep-scan-width" x="305" y="470" width="0" height="210"/></clipPath></defs>
 <g id="ep-camera"><g class="ep-axes"><path d="M35 100H945V900H35ZM35 430H945M35 750H945M325 100V900M655 100V900"/><path d="M15 100H45M15 430H45M15 750H45M935 100H965M935 430H965M935 750H965"/></g>
 <path id="ep-bus" d="M160 340V430H820V340M490 340V430"/>
 <g id="ep-spend" transform="translate(160 270)"><circle r="112" class="ep-ring"/>${headphones}<path class="ep-dimension" d="M-100 100H100M-100 90V110M100 90V110"/></g>
 <g id="ep-capital" transform="translate(490 270)"><rect x="-108" y="-80" width="216" height="160"/>${capital}<path id="ep-crack" d="M15-80L-10-35L18-8L-12 30L12 55L-8 80"/></g>
 <g id="ep-debt" transform="translate(820 270)">${debts}<path class="ep-dimension" d="M-112-85V95M-120-85H-104M-120 95H-104"/></g>
 <path id="ep-trend" d="M375 360L415 324L448 335L490 290L530 310L568 250L588 360"/>
 <path id="ep-pressure" d="M80 145H900V790H80Z"/>
 <g id="ep-extra" transform="translate(330 570)">${headphones}<path id="ep-cross" d="M-95 90L95-105"/></g>
 <g id="ep-food" transform="translate(720 570)"><path d="M-78-30L-60 85H60L78-30ZM-40-30V-70C-40-120 40-120 40-70V-30M-35 0V55M0 0V55M35 0V55"/></g>
 <path id="ep-table-axis" d="M160 340V720M100 430H890M100 720H890M490 430V720"/>
 <path id="ep-inspect-leaders" d="M455 350L305 470M525 350L675 470M305 470H675V680H305Z"/>
 <g id="ep-inspection"><rect x="305" y="470" width="370" height="210" class="ep-inspection-bg"/><rect x="305" y="470" width="370" height="210" fill="url(#ep-hatch)"/><path d="M340 510H640M340 550H640M340 590H640M340 630H640" class="ep-cover-lines"/>
 <g clip-path="url(#ep-scan-clip)"><rect x="305" y="470" width="370" height="210" class="ep-xray-bg"/><path class="ep-danger" d="M490 505L555 625H425ZM490 545V580M490 601V604"/></g><path id="ep-scanner" d="M305 455V695"/>
 </g><path id="ep-isolate" d="M700 450V700M690 450H710M690 700H710"/>
 <g id="ep-speculation"><path d="M750 520L790 590H710ZM850 520L890 590H810Z"/></g>
 <path id="ep-debt-rail" d="M820 350H500V640M490 640H510"/>
 <path id="ep-resolve" d="M160 340V595H820V340M490 340V595"/>
 <g id="ep-check-0" class="ep-check" transform="translate(160 610)"><circle r="32"/><path d="M-17 0L-4 14L20-16"/></g><g id="ep-check-1" class="ep-check" transform="translate(490 610)"><circle r="32"/><path d="M-17 0L-4 14L20-16"/></g><g id="ep-check-2" class="ep-check" transform="translate(820 610)"><circle r="32"/><path d="M-17 0L-4 14L20-16"/></g>
 </g>`;mount.append(svg);
 const $=id=>svg.querySelector('#ep-'+id),opacity=(id,a)=>$(id).style.opacity=Math.max(0,Math.min(1,a)),trace=(id,t)=>{const e=$(id),n=e.getTotalLength();e.style.strokeDasharray=n;e.style.strokeDashoffset=n*(1-clamp(t));};
 const poses=[[0,1,490,490],[125,1,490,490],[170,1.65,160,330],[197,1.65,160,330],[217,1.5,490,330],[242,1.5,820,330],[265,1.5,820,330],[286,1.55,490,340],[330,1.55,490,340],[388,1,490,490],[452,1,490,490],[485,1.2,230,430],[548,1.2,230,430],[585,1,490,490],[615,1,490,490],[650,1.4,490,400],[780,1.4,490,400],[824,1.25,590,430],[850,1.25,590,430],[880,1.2,700,430],[898,1.2,700,430],[950,1,490,490],[1099,1,490,490]];
 function camera(f){let a=poses[0];for(let i=1;i<poses.length;i++){const b=poses[i];if(f<b[0]){const t=u(f,a[0],b[0]);return a.slice(1).map((v,j)=>mix(v,b[j+1],t));}a=b;}return a.slice(1);}
 return{draw(f){
  const[z,x,y]=camera(f);$('camera').setAttribute('transform',`translate(${490-z*x} ${490-z*y}) scale(${z})`);
  const spendFocus=f>=149&&f<198,capitalFocus=f>=198&&f<224||f>=266&&f<349||f>=616&&f<856,debtFocus=f>=224&&f<266||f>=856&&f<898,wide=f<149||f>=349&&f<461||f>=898;
  for(const[id,focus]of[['spend',spendFocus||f>=461&&f<616],['capital',capitalFocus],['debt',debtFocus]])opacity(id,wide||focus?1:.28);
  trace('bus',f<149?.45:f<388?u(f,149,265):1);$('bus').style.stroke=f>=310&&f<388?'var(--risk)':'var(--accent)';
  opacity('crack',u(f,310,330)*(1-u(f,388,405)));opacity('trend',u(f,266,278)*(1-u(f,349,370)));trace('trend',u(f,266,310));
  opacity('pressure',.7*u(f,349,370)*(1-u(f,388,410)));$('pressure').setAttribute('transform',`translate(${490*(1-(1-.04*u(f,349,380)))} ${470*.04*u(f,349,380)}) scale(${1-.04*u(f,349,380)})`);
  const compare=u(f,563,583),toSection=u(f,616,643);opacity('table-axis',u(f,461,482)*(1-u(f,680,696)));const axis=[160,340,720,100,430,890,100,720,890,490,430,720],section=[490,350,680,305,470,675,305,680,675,490,470,680],v=axis.map((n,i)=>mix(n,section[i],toSection));$('table-axis').setAttribute('d',`M${v[0]} ${v[1]}V${v[2]}M${v[3]} ${v[4]}H${v[5]}M${v[6]} ${v[7]}H${v[8]}M${v[9]} ${v[10]}V${v[11]}`);
  opacity('extra',u(f,461,484)*(1-u(f,616,632)));$('extra').setAttribute('transform',`translate(${mix(160,330,compare)} ${mix(870,570,u(f,461,486))}) scale(.75)`);opacity('cross',u(f,516,535));trace('cross',u(f,516,535));
  opacity('food',compare*(1-u(f,616,632)));$('food').setAttribute('transform',`translate(720 ${mix(720,570,compare)}) scale(.8)`);
  opacity('inspect-leaders',u(f,616,643)*(1-u(f,856,878)));trace('inspect-leaders',u(f,616,643));opacity('inspection',u(f,686,704)*(1-u(f,856,878)));
  const scan=u(f,...C.motion.actionWindows.riskReveal);$('scan-width').setAttribute('width',370*scan);$('scanner').setAttribute('transform',`translate(${370*scan} 0)`);opacity('scanner',f>=686&&f<783?1:0);
  opacity('isolate',u(f,783,808)*(1-u(f,856,878)));trace('isolate',u(f,783,808));opacity('speculation',u(f,783,800)*(1-u(f,842,856)));$('speculation').setAttribute('transform',`translate(${220*u(f,806,848)} ${-80*u(f,806,848)})`);
  opacity('debt-rail',u(f,856,866)*(1-u(f,898,935)));trace('debt-rail',u(f,856,878));
  for(let i=0;i<6;i++){let t=i>=2?u(f,856+(5-i)*3,871+(5-i)*3):0;const horizontal=clamp(t*1.7),vertical=clamp((t-.58)/.42),e=$('debt-'+i);e.setAttribute('transform',`translate(${-320*horizontal} ${350*vertical})`);e.style.opacity=i>=2?(1-.78*t)*(1-u(f,898,935)):1;}
  opacity('resolve',u(f,898,955));trace('resolve',u(f,898,955));for(let i=0;i<3;i++)opacity('check-'+i,u(f,[959,1003,1036][i],[977,1021,1054][i]));
  return{camera:{scale:z,focus:[x,y]},planPersistent:true,tableToSection:toSection,scan,retainedDebtUnits:2,portrait:'fixed-right-circle',stations:['spend','capital','debt']};
 }};
}
