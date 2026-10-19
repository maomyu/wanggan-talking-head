import{makeDrawing}from'./drawing-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "marker-sketch", "name": "记号笔速写", "palette": {"bg": "#ece8df", "fg": "#253b45", "muted": "#52616a", "accent": "#8b442e", "caption": "#fffaf0", "portrait": "#ece8df"}, "base": {"x": 225, "y": 585, "w": 630}, "css": "#title{font-size:100px;letter-spacing:-2px}#subtitle{font-size:48px}#kicker{border-left:6px solid #8b442e;padding-left:16px}#captions{border-top:5px solid #253b45}"};
export async function buildArt(ctx){return makeDrawing(ctx,{mode:"marker-sketch",geometry})}
