# 统一入口与局部修改

新片先按[素材与原声](../../../docs/素材与原声.md)选用户自己的口播，执行[新素材制作流程](../../../docs/新素材制作流程.md)。route会返回该素材偏好与相应参考；init只导入明确传入的文件，不自动寻找、下载或替换人物。

先理解用户的中文需求，再选择scope。CLI的关键词匹配只给提示，不代替代理判断。

| 请求 | 读取完整skill | 执行范围 |
|---|---|---|
| 制作完整口播 | 统筹＋四模块 | 内容粗剪、画风、排版、动效、合成与检查 |
| 只改画风 | 统筹调度规则＋画风 | 材料、颜色、字体与媒介协调，记录必要关联调整 |
| 字幕大一点、改标题构图 | 统筹调度规则＋排版 | 字号、断行、位置、阅读与保护区 |
| 调整人物让位、图解入场 | 统筹调度规则＋动效 | 路径、缓动、错峰、可读窗口 |
| 重剪、改停顿和转场 | 统筹调度规则＋剪辑 | 源入出点、语义、声画接缝、字幕与动作重映射 |

“保留画风和剪辑，只改字幕”只进入排版。多个明确变化可以由统筹调度相关模块，不因出现多个名词就强制重做四模块。现有成片没有工程时先导入素材并还原必要上下文；不凭已编码画面声称能恢复原来所有图层。

## 本地入口

从本插件实际路径执行 `node scripts/studio.mjs help`。命令接受绝对项目路径，插件可位于中文或带空格目录；实现使用参数数组，不拼接shell指令。依赖检测和项目默认目录没有写死本机用户名。

- `doctor`：检查固定HyperFrames、Python库、ffmpeg/ffprobe、字体和四个完整模块。
- `setup`：仅在本包runtime安装锁定Node依赖和Python虚拟环境。系统Node22+、Python3.11+、ffmpeg/ffprobe作为外部基础工具，不修改全局插件配置。
- `route --request 中文需求`：输出范围提示、需读取的完整skill路径。确认语义后可用 `--mode full|art-direction|layout|motion|editing` 明确选择。
- `init --project 新目录 --source 视频 --transcript 字幕 --request 需求`：导入新素材；字幕可省略，但必须在设计阶段获得可靠转写与时间依据。当前包不内置ASR模型或语音生成服务，可以使用当前环境已有能力。
- `init --project 新目录 --example approved --style magazine`：显式复现已实测的纸本素材、21句字幕与四模块方案。示例与新素材禁止混用，避免带入错误字幕和剪点。
- `run --project 项目`：按“构建→声音与字体→检查→渲染→实际编码核验”顺序执行。可用 `--until build|check|render|verify` 截止；默认verify。
- `preview --project 项目`：启动或复用本项目的本机Range服务，返回真实URL。`stop`只停止通过项目ID核实的本项目服务。

## 整片制作的责任

整片或解释编排先完整读取[语义编排与素材协作](../../../docs/语义编排与素材协作.md)。`route`和`init`返回的`requiredReferences`给出当前安装位置的完整规范。按照本次原声重新设计场景事件和交接，再进入构建；仅改字幕等局部工作保留既有内容关系。固定示例仍明确复现原案例，不会因入口升级变成任意新稿的自动创意器。

统一入口不是自动创意模型。代理先按照四个完整skill形成本片的brief、四模块方案和可重复构建入口。新素材的初始化状态是awaiting-design，设计未完成就明确报缺项，不生成假成片。

默认项目结构为 plans、assets、scripts、outputs、qa。四个方案分别是art-direction.json、layout-plan.json、motion-plan.json、edit-plan.json。创意字段按本片需要设计；brief.json至少给出width、height，最终输出给出timing.json的fps、frameCount、duration与字幕。源片保留assets/master.mp4，源转写为assets/canonical-native.srt。

新项目由代理实现 `scripts/build-project.mjs --project <路径>`，生成index.html、timing.json、edit-plan.json。剪辑输出的audioSegments使用sourceIn/sourceOut/outputIn/outputOut整数帧，runtime据此统一生成assets/edited-voice.wav。构建时不得用定时器、随机数或播放历史推导状态。

approved-reference仅复现随包参考，也允许在其方案范围内做修改；它不是任意题材的通用模板。选择不同画风或资料结构时由完整模块重新设计，可使用custom构建入口；避免为了复用示例删除新内容。

## 单模块修改

1. 先完整读取旧工程和用户约束，记录哪些必须保持。
2. 用 `revise --from 原项目 --out 新目录 --module layout --request 需求` 建新版本。原项目不改，旧成片与报告不复制为新成果。
3. 只修改新版本所选模块方案及必要的scripts实现。源素材和其余三份方案默认受哈希保护；非editing修改还要保护总帧数、镜头区间、字幕原文与边界、原声PCM。
4. 确需关联模块修改时，在新版本创建时传 `--allow-dependent motion --reason 具体理由`，不要悄悄绕过保护。既有任务已授权的必要依赖调整可继续完成，记录理由，不额外设置人为确认关卡。
5. 用同一个run入口重建、检查和渲染。派生HTML、声音、字体和抽帧由同一流程刷新，不手工换最终视频。
6. 核对qa/scope-check.json和新旧输出，实际查看本次成片。脚本守住了输入与时序不等于视觉审美自动合格。

示例：把caption.size从48改为54，只变排版；画风、动效方案、EDL、原声与字幕时序保持一致。不要为了演示接口而强制未来字幕都用54。

当前为正式插件。通过插件skill入口或本包绝对路径调用；安装状态以Codex插件列表实际记录为准。

## 12套跨模块编排

先读[编排库与协作](../../../docs/编排库与协作.md)及当前模块对应补充。`choreographies`查询完整规则，`recipe --style A04 --composition C05 --kind comparison`比较真实用途与候选。`init --source`只记录搭配并等待本片完整设计；明确固定样例可用`init --example approved --style A04 --composition auto`重建新版主搭配，再使用同一run/preview/revise。

12套不是替代完整专家的短提示词。100条新主搭配已完成固定素材整片核验，其他自由组合在本片检查前仍为候选。局部修改的额外choreography方案默认受保护；仅调整字幕时改layout-plan.caption，由构建入口真实驱动，不修改其他模块。
