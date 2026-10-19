import{makeEditorial}from'./editorial-stage.js';
export const LOOK={"key": "newspaper", "name": "新闻报纸", "palette": {"bg": "#f0edde", "fg": "#242c27", "muted": "#51594e", "accent": "#843c2c", "caption": "#f8f5e9", "portrait": "#f0edde"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#title{font-family:Serif;font-weight:700;font-size:100px}#captions{border-top:6px double var(--fg)}#subtitle{border-bottom:2px solid var(--fg);padding-bottom:18px}"};
export async function buildArt(ctx){return makeEditorial(ctx,"newspaper")}
