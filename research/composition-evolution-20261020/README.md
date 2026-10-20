# 口播编排差异化研究

目标：保留正式1.13.0的100种画风材料，研究与落地不同的信息层级、人物关系、动作和视觉交接。没有新生成图片，便于判断编排本身的贡献。当前项目在test，正式插件和已安装缓存保持。

先看 `review.html`：12套编排、同画风自由切换、原版/新版对照、100画风的4个实际状态、6条实际8秒MP4。网页预览使用源视频的原声与媒体时钟；MP4是固定HF依赖真实逐帧渲染的独立产物。

研究报告为 `调研结果.md`，三个模块的完整研究补充在 `modules/`，各条适配在 `catalogue.json`。原四个专家skill全文留在正式插件，本目录只追加协作方法，没有用短骨架替换原提示词。

## 实际范围

- 12个主编排系统适配100个稳定画风ID；不是100套互斥布局，也不把基本技法换名字重复计数。
- 固定已认可财经复现素材，1100帧/30fps/36.67秒，21条字幕和原声；人物原色、真圆角落窗、字幕top1600/60px。
- 100套原生完整时间轴，各4张样帧；6条MP4只截源461—701帧，8秒，展示完整动作与下一状态。不是100条新版整片编码。
- 当前是作者研究和自查。正式升级前还要对所选编排完整编码、听看和登记。非精确像素项、审美待修和未实测方法保存在检查记录，不借旧结果通过。

## 在本机复建

需要正式插件1.13.0的源与已准备运行环境，默认根 `~/plugins/wanggan-talking-head`。遵循其doctor结果、固定依赖和本地字体，不自动升级。

1. 使用插件固定Python运行 `scripts/prepare.py`，通过明确的 `--example approved` 复现入口准备100个独立项目。只研究某几项时可在脚本后传画风key。
2. `scripts/refresh-design.py` 为已有项目构建材料与新导演层，同时保护原视频、WAV和源剪辑映射。
3. `scripts/finalize-adapter.py` 仅同步最终导演/构建代码并绑定当前哈希。改过代码后必须重新采样，不能借用旧图和旧MP4验收。
4. `scripts/start-preview.py` 启动本机Range服务；`qa/preview-server.json` 给出真实端口。`review.html` 和所有资产应在同一根目录运行，HTML不能脱离字体与媒体单文件拷走。
5. 固定Node执行 `scripts/sample.mjs` 捕获100×4原生样帧，并取旧版对照；`scripts/audit-layout.mjs` 实测400个DOM状态；`scripts/same-art-samples.mjs` 隔离画风做12套编排对照。
6. `scripts/short-tests.py --revision 新名字 [key...]` 先check再渲染。最多2任务×3workers，已有MP4不覆盖。本轮有效结果：v5的magazine/type-poster/blueprint/precision，v6的origami，v7的clay。旧short-tests目录为诊断历史。
7. `scripts/verify-shorts.py` 实际解码核查声音、帧数和抽帧；可传单个key只重查改动项。`scripts/contact-sheets.py` 生成检查拼版；`scripts/finalize-results.py` 仅在当前100项哈希与证据匹配后写最终检查记录。

`scripts/catalogue.py` 是一次性的方案生成来源；已有证据、实际实现说明和MP4链接写入catalogue.json后不要直接重跑覆盖。更改配方应合并既有状态和证据，再针对变更项实测。

## 源码与研究同步

GitHub私有仓库保存研究源码、配方、附录、逐站来源记录和小型检查证据。大批MP4、逐帧缓存、运行依赖、100个生成工程不提交；原正式样例材料与模板已由正式仓库管理，可按以上入口复建。

本目录引用的网页截图只用作研究依据，不作为口播视频素材；未提取付费资源。摄影资料的作者/许可/数字合成标注继承各原模板。当前固定样例不代表任意新文案自动生成素材和剪辑。
