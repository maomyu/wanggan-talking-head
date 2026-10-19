import{makeDrawing}from'./drawing-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "charcoal", "name": "炭笔擦绘", "palette": {"bg": "#d4d4ca", "fg": "#242927", "muted": "#4b5450", "accent": "#484f49", "caption": "#f8f7ed", "portrait": "#d4d4ca"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#title{font-family:Serif;font-size:106px;font-weight:700}#subtitle{font-size:46px}#art{background:var(--bg)}#captions{border-top:5px solid #4b5450}#person-mask{outline:9px solid #f8f7ed}"};
export async function buildArt(ctx){return makeDrawing(ctx,{mode:"charcoal",geometry})}
