import{makeEditorial}from'./editorial-stage.js';
export const LOOK={"key": "lab-notebook", "name": "实验记录", "palette": {"bg": "#e6eadd", "fg": "#244b65", "muted": "#455c5b", "accent": "#844f42", "caption": "#f9f6e7", "portrait": "#e6eadd"}, "base": {"x": 228, "y": 590, "w": 624}, "css": "#heading{left:92px;width:896px}#title{font-size:91px}#kicker{padding-left:22px;border-left:6px solid var(--accent)}#captions{border-top:0;border-left:5px solid #bf8a80;padding-left:32px}#scene-labels{font-size:40px}"};
export async function buildArt(ctx){return makeEditorial(ctx,"lab-notebook")}
