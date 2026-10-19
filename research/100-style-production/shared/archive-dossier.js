import{makeEditorial}from'./editorial-stage.js';
export const LOOK={"key": "archive-dossier", "name": "档案卷宗", "palette": {"bg": "#d7c6a1", "fg": "#352f24", "muted": "#5e513b", "accent": "#79512d", "caption": "#faf2dc", "portrait": "#d7c6a1"}, "base": {"x": 220, "y": 585, "w": 640}, "css": "#heading{border-left:10px solid #79512d;padding-left:28px;width:952px}#title{font-size:93px}#captions{border:2px solid var(--fg);border-left-width:10px}#person-mask{outline:8px solid #faf2dc;box-shadow:0 0 0 3px #79512d}"};
export async function buildArt(ctx){return makeEditorial(ctx,"archive-dossier")}
