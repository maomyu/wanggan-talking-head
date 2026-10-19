import{makeEditorial}from'./editorial-stage.js';
export const LOOK={"key": "swiss-grid", "name": "瑞士网格", "palette": {"bg": "#f3f1e9", "fg": "#171b19", "muted": "#47524a", "accent": "#b03229", "caption": "#f3f1e9", "portrait": "#f3f1e9"}, "base": {"x": 130, "y": 580, "w": 660}, "css": "#heading{left:64px;width:952px}#title{font-size:105px;letter-spacing:-4px}#subtitle{font-size:46px}#captions{border:0;border-left:12px solid var(--accent);padding-left:24px}#scene-labels{font-size:40px}"};
export async function buildArt(ctx){return makeEditorial(ctx,"swiss-grid")}
