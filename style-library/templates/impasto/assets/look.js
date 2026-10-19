import{makeCraftPaint}from'./craft-paint-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "impasto", "name": "厚涂油彩", "palette": {"bg": "#e7dfd0", "fg": "#40372f", "muted": "#6c5c4c", "accent": "#9e4f31", "caption": "#fff5e5", "portrait": "#e7dfd0"}, "base": {"x": 225, "y": 580, "w": 630}, "css": "#title{font-size:100px}#subtitle{font-size:46px}#captions{border:2px solid #9e4f31}#person-mask{outline:8px solid #cdb99c}"};
export async function buildArt(ctx){return makeCraftPaint(ctx,{mode:"impasto",geometry})}
