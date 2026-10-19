import{makeFiberEast}from'./fiber-east-stage.js';
export const LOOK={"key": "knotted-cord", "name": "线绳编结", "palette": {"bg": "#ece3cf", "fg": "#51432e", "muted": "#6d5f47", "accent": "#94633d", "caption": "#fff7e5", "portrait": "#ece3cf"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#title{font-size:100px}#subtitle{font-size:46px}#captions{border-top:3px solid #94633d;border-bottom:3px solid #94633d}#person-mask{outline:7px solid #c7a571}"};
export async function buildArt(ctx){return makeFiberEast(ctx,{mode:"knotted-cord"})}
