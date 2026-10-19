import{makeGraphic}from'./graphic-stage.js';
export const LOOK={"key": "memphis", "name": "孟菲斯几何", "palette": {"bg": "#f4eade", "fg": "#1f2e35", "muted": "#4d5060", "accent": "#914025", "caption": "#fff8ed", "portrait": "#f4eade"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#title{font-size:103px;letter-spacing:-3px}#subtitle{font-size:47px}#captions{border:4px solid #1f2e35;border-right-width:10px}#person-mask{outline:9px solid #fff8ed;box-shadow:0 0 0 4px #1f2e35}"};
export async function buildArt(ctx){return makeGraphic(ctx,"memphis")}
