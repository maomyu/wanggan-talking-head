# 节奏标准库

本库为设计标准，当前不标为通用渲染器。按语义选择必要项，不强迫全片把所有项都用一遍。新增标准以实际差异为准，改配色或纹理不重复增加画风。

## 人声主导 · `speech-led`

语义与真实重音决定动作落点，音乐不覆盖讲述逻辑。

- 适用：当前全部自有原声口播。
- 避免：每刀强踩音乐；加速人声替动画腾时间。
- 交接：词句锚点、置信度、动作对齐与原声连续。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 显现·读图·释放 · `reveal-hold-release`

完整显现后留可读状态，再交出注意力。

- 适用：关键图解、引句、标签和结果。
- 避免：动作结束即切走；把移动时长当完整阅读时长。
- 交接：完全可读帧、实测读窗与退出结束帧。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 强弱对比 · `contrast-pulse`

重要转折一次有力，普通解释降低动作密度。

- 适用：转折、反驳、揭示。
- 避免：每句话都高潮；固定每两秒必换镜。
- 交接：强弱段标注、主动作预算和安静区。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 逐层展开 · `progressive-build`

依据理解依赖逐步加信息，保留已理解的结构。

- 适用：机制与步骤。
- 避免：越叠越满；每一步都从零重画。
- 交接：进入顺序、保留层与最终结构读窗。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 有意停顿 · `deliberate-pause`

让关键结果被看见，允许充分稳定而非强迫万物运动。

- 适用：转折后的理解、情绪与复杂图。
- 避免：为躲冻结指标加无意义漂移；停顿与人声相冲。
- 交接：停顿理由、持续区间及仍需保留的原声。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 铺垫与兑现 · `setup-payoff`

早先建立的对象或问题在后段得到有意义的回答。

- 适用：前后连续、寓言和观点收束。
- 避免：为了回收硬套无关对象；悬念不兑现。
- 交接：铺垫对象、未决问题、兑现锚点及结果。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

## 结尾收束 · `ending-resolve`

减少新动作，用既有状态和人物完成最后理解。

- 适用：总结、态度和行动结尾。
- 避免：最后一秒塞新信息或强造行动号召。
- 交接：最后主阅读对象、回收完成与末帧停稳。
- 控制字段：anchorFrame, fullyReadableFrame, holdEndFrame, density, priority
- 结构依赖：由本片语义和共享合同决定
- 状态：设计标准；尚无该11模块体系下的通用渲染验收。

