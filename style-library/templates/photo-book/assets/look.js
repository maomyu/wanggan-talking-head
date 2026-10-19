import{makePhotoBook}from'./editorial-extra.js';import geometry from'./atlas-geometry.js';
export const LOOK={"key": "photo-book", "name": "摄影画册", "palette": {"bg": "#f0f0e7", "fg": "#28352f", "muted": "#576157", "accent": "#735142", "caption": "#fffdf7", "portrait": "#f0f0e7"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#title{font-family:Serif;font-weight:700;font-size:98px}#subtitle{font-family:Serif;font-size:46px}#person-mask{outline:9px solid #fffdf7}#captions{border-top:1px solid #777f72}"};
export async function buildArt(ctx){return makePhotoBook(ctx,geometry)}
