# 转场标准库

本库为设计标准，当前不标为通用渲染器。按语义选择必要项，不强迫全片把所有项都用一遍。新增标准以实际差异为准，改配色或纹理不重复增加画风。

## 纸页擦除 · `paper-wipe`

已有纸页沿有动机路径覆盖旧状态并交出新状态。

- 适用：纸本段落、条件与结论转换。
- 避免：随便飞一张纸挡住接不上的关系。
- 交接：旧画面最后可读帧、完全覆盖帧和新画面首帧。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：surface.paper
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 翻面衔接 · `page-match`

同一页的正反面或相邻页承接语义。

- 适用：表面与背面、问题与解释。
- 避免：翻面换了对象身份；文字镜像闪现。
- 交接：页ID、轴心、遮字窗口和两面内容。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：surface.paper
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 场景替换 · `scene-replace`

在明确语义断点替换环境，保留必要注意锚点。

- 适用：段落转折、对象不连续的主题变化。
- 避免：硬造物件变形来追求无缝；声音突然断开。
- 交接：源与目标状态、保留锚点及原声连续条件。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 同物承接 · `object-match`

同一对象以相同或可解释的位置、朝向和尺度进入下一状态。

- 适用：跨图景追踪一个资源或物件。
- 避免：只凭颜色相似假称同一物件；暗改数量。
- 交接：对象ID、两端锚点、出入速度和身份核验。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 前景遮挡交接 · `foreground-occlusion`

有意义的前景对象短暂覆盖连接边界。

- 适用：人物跳切覆盖、近景物件交接。
- 避免：覆盖不足露出断点；任意黑块遮镜头。
- 交接：覆盖几何、有效不透明帧与底层切换点。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 关系展开 · `relation-expand`

从一处局部关系扩展成下一张完整关系图。

- 适用：分解、框架和因果延展。
- 避免：图形变化但关系无新信息；所有元素重建。
- 交接：共享对象、展开次序与旧关系保留范围。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 字形与概念交接 · `type-handoff`

前句关键词成为后句标题、标签或对象。

- 适用：概念递进、术语解释。
- 避免：形似但语义无关的字变形；文字重复过多。
- 交接：原词与新角色、基线、停稳与可读过渡。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 有依据的直切 · `clean-cut`

在语义、动作或观察目的改变时直接切换。

- 适用：真人表述、清楚的段落转换。
- 避免：每刀都加特效；不听原声接续就切。
- 交接：切点理由、声画连续和首末可读帧。
- 控制字段：fromScene, toScene, sharedObjectId, handoffFrame, coverInterval
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。
