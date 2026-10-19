import{makeGraphic}from'./graphic-stage.js';
export const LOOK={"key": "negative-space", "name": "负空间图形", "palette": {"bg": "#f3eee0", "fg": "#1a3340", "muted": "#4d5e5c", "accent": "#8d4a32", "caption": "#f3eee0", "portrait": "#f3eee0"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#title{font-family:Serif;font-weight:700;font-size:98px}#kicker{letter-spacing:4px}#captions{background:#1a3340;border-top:0}#caption-text{color:#f3eee0}#recap span{background:#f3eee0}"};
export async function buildArt(ctx){return makeGraphic(ctx,"negative-space")}
