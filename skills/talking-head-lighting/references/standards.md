# 光影质感标准库

本库为设计标准，当前不标为通用渲染器。按语义选择必要项，不强迫全片把所有项都用一遍。新增标准以实际差异为准，改配色或纹理不重复增加画风。

## 纸面颗粒收束 · `paper-grain-finish`

在合成层控制纸感的统一尺度与轻微变化。

- 适用：印刷、纸页和拼贴。
- 避免：与材质模块重复叠两层颗粒；噪点爬满字。
- 交接：引用材质纹理ID，只调合成强度，不重复生纹理。
- 控制字段：targetObject, lightRegion, shadowRule, compositeOrder
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 局部聚光 · `local-spotlight`

让当前对象略亮，周围保持可辨认和阅读对比。

- 适用：注视、结论和局部展示。
- 避免：对人物单独调色；黑场吞掉字幕。
- 交接：光区、衰减、亮度变化及文字对比复查。
- 控制字段：targetObject, lightRegion, shadowRule, compositeOrder
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 均匀柔光 · `even-soft`

稳定、低刺激的面光支持阅读。

- 适用：写实极简、长段解说、纸本。
- 避免：阴影全无致对象层次不清；真人强美颜。
- 交接：背景、对象亮度与原人像独立合成。
- 控制字段：targetObject, lightRegion, shadowRule, compositeOrder
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 接触阴影 · `contact-shadow`

以局部投影说明对象落点、叠层和承重。

- 适用：纸页、模型和叠放。
- 避免：对象离地而阴影不变；大黑影压字。
- 交接：接触面、离地高度、阴影方向和层级。
- 控制字段：targetObject, lightRegion, shadowRule, compositeOrder
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 受控轮廓光 · `controlled-rim`

用有限边缘亮度分离体量。

- 适用：模型、金属和暗背景对象。
- 避免：所有边缘都发光；正文发光变糊。
- 交接：轮廓范围、背景分离和亮度上限。
- 控制字段：targetObject, lightRegion, shadowRule, compositeOrder
- 结构依赖：object.volume, material.metal, material.transparent
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 平面印刷明暗 · `flat-print-light`

以墨面、留白和少量层影建立深度，不模拟强镜面。

- 适用：网点、几何印刷和编辑图形。
- 避免：纸面出现液态金属反射；多光源不一致。
- 交接：明暗面、层影与无反射区域。
- 控制字段：targetObject, lightRegion, shadowRule, compositeOrder
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。
