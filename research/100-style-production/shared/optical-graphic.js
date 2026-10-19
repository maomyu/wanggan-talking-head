import{makeGraphic}from'./graphic-stage.js';
export const LOOK={"key": "optical-graphic", "name": "动势错视", "palette": {"bg": "#f8f7f0", "fg": "#171b1b", "muted": "#515954", "accent": "#222222", "caption": "#f8f7f0", "portrait": "#f8f7f0"}, "base": {"x": 230, "y": 585, "w": 620}, "css": "#title{font-size:104px;letter-spacing:-4px}#subtitle{font-size:47px}#captions{border-top:7px solid #171b1b}#person-mask{outline:10px solid #f8f7f0;box-shadow:0 0 0 3px #171b1b}"};
export async function buildArt(ctx){return makeGraphic(ctx,"optical-graphic")}
