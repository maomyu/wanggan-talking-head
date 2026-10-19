import{makeRaster}from'./raster-stage.js';
import geometry from './atlas-geometry.js';
export const LOOK={key:'felt-applique',name:'毛毡贴画',palette:{bg:'#dce3d0',fg:'#344d3f',muted:'#566d57',accent:'#9f5139',caption:'#f5f1de',portrait:'#f5f1de'},base:{x:220,y:585,w:640},css:'#architecture{inset:505px 36px 670px;background:#eaf0df;border-radius:65px;border:4px dashed #91a17b}#title{font-size:101px}#person-mask{outline:13px solid #f5f1de;outline-offset:1px;box-shadow:3px 8px 0 #acb99c}#captions{border-top:3px dashed #9f5139;box-shadow:0 7px 0 #b5c0a2}#recap span{border-top-style:dashed}'};
export async function buildArt(ctx){document.querySelector('#credit').textContent='人物原色 · 角落圆窗 · 原声保留\nAI生成毛毡图解，属于原稿解释示意';return makeRaster(ctx,{geometry,motion:'felt'});}
