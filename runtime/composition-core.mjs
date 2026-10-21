// Pure rules shared by the browser and CLI. A valid recipe is a design plan, not a rendered film.
export function resolveRecipe(recipe, axes, standards, policy) {
  const errors=[], warnings=[], selections={};
  if (!recipe || recipe.schemaVersion!==1 || !recipe.selections || typeof recipe.selections!=='object') return {ok:false,errors:['需要schemaVersion=1及selections对象'],warnings};
  const byId=new Map(standards.map(s=>[s.id,s]));const byAxis=new Map(axes.map(a=>[a.id,a]));
  for(const key of Object.keys(recipe.selections)) if(!byAxis.has(key)) errors.push(`未知维度：${key}`);
  for(const axis of axes){
    const ids=recipe.selections[axis.id];
    if(!Array.isArray(ids)||!ids.length){errors.push(`缺少${axis.name}选择`);continue;}
    if(new Set(ids).size!==ids.length)errors.push(`${axis.name}存在重复标准`);
    if(['art-style','palette'].includes(axis.id)&&ids.length!==1)errors.push(`${axis.name}须明确一个主项；局部混合另做逐场方案`);
    selections[axis.id]=[];
    for(const id of ids){const s=byId.get(id);if(!s){errors.push(`未知标准：${id}`);continue;}if(s.axis!==axis.id){errors.push(`${id}属于${s.axis}，不能放进${axis.id}`);continue;}selections[axis.id].push(s);}
  }
  const selected=Object.values(selections).flat();const capabilities=new Set(selected.flatMap(s=>s.provides));
  for(const s of selected)if(s.requiresAny?.length&&!s.requiresAny.some(f=>capabilities.has(f)))errors.push(`${s.name}需要结构：${s.requiresAny.join(' 或 ')}；先补造型或改动作`);
  const o=recipe.overrides??{};
  if(Object.keys(o).some(k=>!['notes'].includes(k)))errors.push('overrides目前仅支持notes；颜色等实参数写入专业产物，不能在此绕过人物/字幕/原声保护');
  if(selected.some(s=>s.id==='literary-quote'))warnings.push('文学引句仅在逐场提供真实原文和出处时使用，不为配方补写名言。');
  if(selected.some(s=>s.id==='character-parable'))warnings.push('人物寓言仅在逐场说明虚构或真实来源时使用，不改写真人经历。');
  if(selected.some(s=>s.id==='paper-grain')&&selected.some(s=>s.id==='paper-grain-finish'))warnings.push('纸纹理共用一个surface纹理ID；材质定尺度，光影只定最终强度与层序。');
  if(!recipe.selections.typography?.includes('raised-captions'))warnings.push('字幕上移保护由共享政策继续生效，即使未选上移字幕标准也不可取消。');
  if(selected.some(s=>['glass-clear','metal-brushed'].includes(s.id))&&recipe.selections['art-style']?.includes('editorial-print'))warnings.push('透明/金属仅作有理由的局部对象，复查是否破坏印刷主语言。');
  return {ok:errors.length===0,stage:'planning-only',recipeId:recipe.id??null,errors,warnings,selections,capabilities:[...capabilities],policy,order:['information','art-style','representation','typography','palette','material','lighting','camera','object-motion','rhythm','transition'],next:'由代理按完整技能执行本片实现、渲染、实际MP4核验；解析成功不等于制作完成。'};
}
const affected={
 'art-style':{'palette':'身份规则是否保留','material':'外观与风格一致性','representation':'载体和空间语言','typography':'字阶与阅读风格','lighting':'合成规则'},
 palette:{material:'纹理和底色叠合',lighting:'光影后的实际颜色',typography:'真实合成文字对比'},
 material:{representation:'几何与材料边缘匹配','object-motion':'材料行为是否兼容',lighting:'反射/颗粒/接触关系',typography:'纹理影响字形'},
 representation:{material:'表面绑定','object-motion':'部件和锚点重映射',camera:'观察范围',transition:'同物交接',typography:'对象和文字保护区',lighting:'体量与接触'},
 'object-motion':{rhythm:'结果读窗',typography:'全路径避让',transition:'出入交接',camera:'焦点与路径',lighting:'动态接触阴影'},
 camera:{typography:'投影、裁切与文字保护区','object-motion':'世界坐标与屏幕坐标',transition:'两端取景锚点',lighting:'视角变化后的层次',rhythm:'观察与阅读时间'},
 transition:{'object-motion':'退出/进入状态',rhythm:'读窗和桥接长度',typography:'退出残字与新字',camera:'交接取景'},
 typography:{palette:'对比','object-motion':'字形边界与强调线',camera:'取景与标签投影',transition:'退出残影',rhythm:'实际读完时间'},
 lighting:{palette:'合成后颜色',material:'反射/纹理共用',typography:'光区经过时对比'},
 information:{representation:'对象任务改变','object-motion':'动词与结果改变',camera:'理解任务改变',transition:'场间关系改变',typography:'文字与关系图改变',rhythm:'信息难度改变'},
 rhythm:{'object-motion':'动作起止重排',transition:'覆盖帧和出入点',camera:'镜头时序',typography:'完整可读窗口'}
};
export function planChange(changed,axes){
 const valid=new Set(axes.map(a=>a.id));const list=[...new Set(changed)];if(!list.length||list.some(a=>!valid.has(a)))throw Error('修改维度必须为已知十一类之一');
 const check=new Map();for(const a of list)for(const [b,reason]of Object.entries(affected[a]??{}))if(!list.includes(b)){if(!check.has(b))check.set(b,[]);check.get(b).push(`${a}：${reason}`);}
 return {rewrite:list,revalidate:[...check].map(([axis,reasons])=>({axis,reasons})),freezeDecisions:axes.map(a=>a.id).filter(a=>!list.includes(a)),preserve:['source-media','original-voice','transcript-meaning','object-identity','unrelated-timing','previous-version'],requiresRewriteOfChecks:false,edlChanged:false,note:'复查不等于重做；如确需改源EDL，单独登记并重映射所有字幕/音频/语义锚点。'};
}
export function compileScenes(recipe,plan,axes,standards,policy){
 const resolved=resolveRecipe(recipe,axes,standards,policy);const errors=[...resolved.errors];const scenes=plan?.scenes;
 if(!plan?.source?.sha256?.match(/^[a-f0-9]{64}$/)||plan.source.ownership!=='user-owned')errors.push('需绑定自有源片SHA256');
 if(!Number.isInteger(plan?.frames)||plan.frames<=0||!Number.isFinite(plan?.fps)||plan.fps<=0)errors.push('需要真实总帧数与fps');
 if(!Array.isArray(scenes)||!scenes.length)errors.push('需要实际场景计划');
 let last=0;const sceneIds=new Set();const known=new Set((plan?.objects??[]).map(o=>o.id));
 const selectedInfo=new Set(recipe?.selections?.information??[]);
 for(const s of scenes??[]){
  if(!s.id||sceneIds.has(s.id))errors.push('场景ID缺失或重复');sceneIds.add(s.id);
  if(!Number.isInteger(s.startFrame)||!Number.isInteger(s.endFrame)||s.startFrame!==last||s.endFrame<=s.startFrame||s.endFrame>plan.frames)errors.push(`${s.id}时间不是连续合法半开区间`);
  last=s.endFrame;
  if(!selectedInfo.has(s.relation))errors.push(`${s.id}信息关系${s.relation}未在配方候选池`);
  for(const k of ['purpose','action','result','handoff'])if(typeof s[k]!=='string'||!s[k].trim())errors.push(`${s.id}缺少${k}`);
  if(!s.sentenceIds?.length)errors.push(`${s.id}缺少原句绑定`);
  if(!Array.isArray(s.objects)||!s.objects.length||s.objects.some(id=>!known.has(id)))errors.push(`${s.id}引用未知或空对象`);
  if(!Array.isArray(s.readWindow)||s.readWindow.length!==2||s.readWindow.some(x=>!Number.isInteger(x))||s.readWindow[0]<s.startFrame||s.readWindow[1]>s.endFrame||s.readWindow[1]<=s.readWindow[0])errors.push(`${s.id}缺少合法完整读窗`);
  if(s.relation==='literary-quote'&&(!s.quote?.text||!s.quote?.source))errors.push(`${s.id}引句缺少原文或来源`);
  if(s.relation==='character-parable'&&!['fiction-marked','sourced-real'].includes(s.characterIdentity))errors.push(`${s.id}寓言/真人身份未标明`);
  if(s.relation==='cause-effect'&&(!s.causalBasis||!s.condition))errors.push(`${s.id}因果缺少条件或依据`);
 }
 if(last!==plan?.frames)errors.push('场景未覆盖完整时长');
 return {ok:errors.length===0,stage:'planning-only',errors,warnings:resolved.warnings,source:plan?.source,frames:plan?.frames,fps:plan?.fps,scenes:scenes??[],moduleTasks:axes.map(a=>({axis:a.id,skill:a.skill,output:a.artifact,ownedFields:a.ownedFields,selections:recipe?.selections?.[a.id]??[]})),rendered:false,note:'已检查计划结构；未证明字形可读、路径无遮挡、事实正确或成片已生成。'};
}
