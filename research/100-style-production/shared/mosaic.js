import{makeCraftPaint}from'./craft-paint-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "mosaic", "name": "马赛克拼片", "palette": {"bg": "#e5dcc6", "fg": "#393c30", "muted": "#64674f", "accent": "#914c35", "caption": "#fbf3df", "portrait": "#e5dcc6"}, "base": {"x": 225, "y": 580, "w": 630}, "css": "#title{font-size:100px}#subtitle{font-size:46px}#captions{border-top:5px solid #914c35;border-bottom:2px solid #914c35}#person-mask{outline:9px solid #c1aa7b}"};
export async function buildArt(ctx){return makeCraftPaint(ctx,{mode:"mosaic",geometry})}
