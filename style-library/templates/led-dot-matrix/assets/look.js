import{makeScreen}from'./screen-stage.js';
export const LOOK={key:'led-dot-matrix',name:'低帧点阵',palette:{bg:'#211e17',fg:'#ffe5ad',muted:'#c7b98d',accent:'#e8b95a',caption:'#363023',portrait:'#aa9875'},base:{x:224,y:585,w:632},css:'#architecture{inset:510px 38px 670px;background:#15160f;border:10px solid #554e3b;box-shadow:inset 0 0 0 4px #080b08;border-radius:13px}#style-label{letter-spacing:5px}#caption-text{color:#ffe5ad}#captions{border-top:4px dotted #e8b95a}#person-mask{outline:6px solid #aa9875;outline-offset:4px}'};
export async function buildArt(ctx){return makeScreen(ctx,'led')}
