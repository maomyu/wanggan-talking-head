import{makeCraftPaint}from'./craft-paint-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "enamel-badge", "name": "珐琅徽章", "palette": {"bg": "#1d2931", "fg": "#f0e7d2", "muted": "#c4bdab", "accent": "#d7ae68", "caption": "#26343d", "portrait": "#1d2931"}, "base": {"x": 225, "y": 580, "w": 630}, "css": "#title{font-size:100px}#subtitle{font-size:46px}#captions{border-top:3px solid #b28b53;border-bottom:1px solid #b28b53}#person-mask{outline:6px solid #b28b53}"};
export async function buildArt(ctx){return makeCraftPaint(ctx,{mode:"enamel-badge",geometry})}
