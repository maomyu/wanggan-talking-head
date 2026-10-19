import{makeTimeline}from'./editorial-extra.js';
export const LOOK={"key": "timeline-almanac", "name": "时间轴年鉴", "palette": {"bg": "#eae7d8", "fg": "#2d443b", "muted": "#56665b", "accent": "#7b4a30", "caption": "#f8f4e7", "portrait": "#eae7d8"}, "base": {"x": 225, "y": 585, "w": 630}, "css": "#title{font-size:100px}#kicker{border-left:8px solid var(--accent);padding-left:17px}#captions{border-left:5px solid var(--accent);border-top:0}"};
export async function buildArt(ctx){return makeTimeline(ctx)}
