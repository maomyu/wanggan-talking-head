import{makeObjectTheatre}from'./object-theatre-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "inflatable-sculpture", "name": "充气软雕", "palette": {"bg": "#f0e6d8", "fg": "#423d35", "muted": "#726858", "accent": "#a05135", "caption": "#fff9ed", "portrait": "#f0e6d8"}, "base": {"x": 225, "y": 580, "w": 630}, "css": "#title{font-size:98px}#captions{border-radius:18px;border-top:3px solid #a05135}#person-mask{outline:9px solid #d9c6a8}"};
export async function buildArt(ctx){return makeObjectTheatre(ctx,{mode:"inflatable-sculpture",geometry})}
