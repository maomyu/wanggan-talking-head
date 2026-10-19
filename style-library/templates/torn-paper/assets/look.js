import{makeRasterIllustration}from'./illustration-raster-stage.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "torn-paper", "name": "撕纸肌理", "palette": {"bg": "#eee7d5", "fg": "#2f453c", "muted": "#566a5c", "accent": "#a44b35", "caption": "#fff8e8", "portrait": "#eee7d5"}, "base": {"x": 225, "y": 580, "w": 630}, "css": "#title{font-size:101px}#subtitle{font-size:46px}#captions{border-top:0;border-bottom:5px solid #a44b35}#person-mask{outline:9px solid #fff8e8}"};
export async function buildArt(ctx){return makeRasterIllustration(ctx,{mode:"torn-paper",geometry})}
