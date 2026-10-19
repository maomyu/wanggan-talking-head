import{makeGraphic}from'./graphic-stage.js';
export const LOOK={"key": "brutalist-type", "name": "粗野排印", "palette": {"bg": "#edece1", "fg": "#171d17", "muted": "#465042", "accent": "#50652d", "caption": "#e9ef73", "portrait": "#edece1"}, "base": {"x": 200, "y": 580, "w": 680}, "css": "#title{font-size:110px;letter-spacing:-5px}#subtitle{font-size:45px}#heading{border-top:7px solid #171d17;padding-top:13px}#captions{border:5px solid #171d17}#person-mask{outline:8px solid #e9ef73;box-shadow:0 0 0 4px #171d17}"};
export async function buildArt(ctx){return makeGraphic(ctx,"brutalist-type")}
