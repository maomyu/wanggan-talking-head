# 网感口播 · 1.21.1

[常用指令与使用指南](docs/常用指令与使用指南.md)：整片指定画风、智能体自由搭配、指定编排，以及字体排版、物体动效、转场、节奏、配色和其他单模块修改。统一入口新增可复制指令，复制自动附带既定人物与素材原则。

统一选择页可由 `catalog-ui` 导出，内含使用指南与可复制示例；已安装插件通过 talking-head-video 调度。19套配方和实际制作实现沿用1.21.0。详见[本次更新验收](docs/1.21.1验收.md)。

# 网感口播 · 1.21.0

19套母画风的完整生产配方与统一调用入口正式收录。母画风、分支、组件分别管理；技术蓝图是精密界面的分支配方，不额外算作母画风。十一类完整协作、原四专家正文与所有旧有效素材/实现保留。

默认只用用户自己的口播和原声，人物原色、角落全路径圆窗、字幕上移。当前已认可方法与同源完整案例继续使用；跨文案等用户有新素材再验证，不冒称任意输入自动成片。

```sh
node scripts/studio.mjs doctor
node scripts/studio.mjs catalog
node scripts/studio.mjs inspect --recipe 水彩
node scripts/studio.mjs init --project /path/to/film --source /path/to/own.mp4 --recipe precision --branch A09 --orchestration diagram
node scripts/studio.mjs revise --from /path/to/film --out /path/to/film-v2 --axes palette --request "只改配色"
node scripts/studio.mjs patch-palette --project /path/to/film-v2 --values /path/to/palette.json
node scripts/studio.mjs catalog-ui --project /path/to/selector
node scripts/studio.mjs preview --project /path/to/selector
```

[19套配方与统一入口](docs/19套配方与统一入口.md) · [分类与配方](docs/分类与配方.md) · [1.21.0收录验收](docs/1.21.0验收.md)。选择页生成制作指令，实际设计和构建由智能体完成；`init`只初始化待设计工程，`reproduce`明确复现绑定源案例。

以下保留历史说明；当前入口和数量以本节为准。

# 网感口播 · 1.20.0

以用户自己的真实口播和原声为源，按文案重新设计图片任务、对象动作、可见结果与前后衔接。人物原色、角落圆窗、字幕上移。

正式采用十一类协作：主画风、配色、材质、造型、物体动效、镜头、转场、字体版式、光影、信息组织、节奏。原四份完整专家正文按原哈希保留，十一类进一步明确职责与交接，不缩短专业方法。

母画风、分支、组件分别管理；原100项编号、素材和实现完整保留。七套用户认可配方：编辑拼贴与印刷、写实极简、技术蓝图、柔质立体、水墨写意、单线手绘、复古网点，带77份实际专业计划、原案例代码与认可哈希。新素材重新设计内容，85项设计标准不冒称通用渲染组件。

新增人物主导、连续图解两套可选编排，与画风分别管理；只改节奏时保护其他十类计划、原片、原声、字幕与编排选择。完整方法和自然语言示例见[编排选择与局部节奏](docs/编排选择与局部节奏.md)，实际收录范围见[1.20.0验收](docs/1.20.0验收.md)。

```sh
node scripts/studio.mjs doctor
node scripts/studio.mjs recipes
node scripts/studio.mjs orchestrations
node scripts/studio.mjs families
node scripts/studio.mjs branches
node scripts/studio.mjs components
node scripts/studio.mjs standards
node scripts/studio.mjs init --project /path/to/film --source /path/to/own.mp4 --recipe minimal --orchestration diagram
node scripts/studio.mjs revise --from /path/to/film --out /path/to/film-v2 --axes typography --request "只调整标题与字幕"
```

完整制作与命令见[分类与配方](docs/分类与配方.md)、[协作合同](docs/协作合同.md)、[能力边界](docs/能力边界.md)。旧工程和`styles --all`、`recipe --style Axx`、`choreographies`继续兼容。工程与临时文件放插件外，默认不上传用户原片与最终视频。

以下保留历史版本的具体实现与制作说明；目录数量、分类入口和职责以本节及协作合同为准。

# 网感口播 1.17.0

正式接入[新素材制作流程](docs/新素材制作流程.md)：读懂新文案，重新设计对象、图片任务、动作结果和连续转场，实际编码后检查并清理制作残留。默认使用用户自己的口播与原声，详见[素材与原声](docs/素材与原声.md)。保留四个完整专家skill、100种画风和12套编排；当前认可与验证边界见[1.17.0验收](docs/1.17.0验收.md)。

新增[语义编排与素材协作](docs/语义编排与素材协作.md)：按本次口播设计对象、动作、可见结果和前后交接，让图片参与解释。用户已认可21.3秒代表片；方法接入五个skill与真实route/init入口，100条旧片未据此重做。见[1.16.0验收](docs/1.16.0验收.md)。

参考总览已支持卡片内在线播放、100条静音同播、全局暂停/跳转、单路原声与1080P大屏，见[1.15.1播放器验收](docs/1.15.1验收.md)。

正式本地插件，新增12套可组合的跨模块编排，包含100种已实现画风（20用户认可、80制作验证）、四个完整专业skill和一个整片统筹入口。100种创意目录分10个家族；全部方向均完成同一口播的完整视频与正式模板。人物保持原色、角落正圆窗、字幕上移。

- [整片统筹](skills/talking-head-video/SKILL.md)
- [画风](skills/talking-head-art-direction/SKILL.md) · [排版](skills/talking-head-layout/SKILL.md) · [动效](skills/talking-head-motion/SKILL.md) · [剪辑转场](skills/talking-head-editing/SKILL.md)
- [100种方向与协作配方](docs/100种画风与协作配方.md) · [画风登记](style-library/catalog.json) · [可选配方](style-library/profiles.json)
- [共同规范](docs/共同制作规范.md) · [组合与验证范围](docs/组合与范围.md) · [声音协作](docs/声音协作.md) · [新增画风](docs/新增画风.md)

自然语言示例：“采用A17剪纸舞台处理这段素材”“A58折纸结构，配推导画布和原声，先做样帧”“你按内容选合适组合”“只把字幕上移，其他保持”。统筹读取完整模块、根据本片素材制作。目录编号稳定，原A01—A15保留，新认可五种为A16—A20。

运行`node scripts/studio.mjs doctor`检查依赖；`styles --all`查询100种；`styles --status approved`查询20种；`recipe --style A58 --sound S01`查看可调整的四项设计建议。配方用于设计交接，不等于一条命令自动完成任意新片。

`init --project 新目录 --source 视频 --style A58`导入本片并等待完整设计；`init --project 新目录 --example approved --style paper-stage`明确复现认可案例。候选不能用认可案例复现器。工程放插件外，单模块修改用`revise`另存。详见[使用说明](docs/使用说明.md)。

渲染器固定HyperFrames0.8.174，依赖集中在本插件runtime，字体和素材本地化，不依赖test目录执行。四份专家正文按哈希保留；一般新增方向经样片和用户认可后晋级；本次100种目标已授权持续制作，通过整片验证后以制作验证状态晋级。声音目前是配方维度与完整交接规范，不新增一个冒称已全面实测的音频skill。

源码与进度同步到GitHub私有仓库maomyu/wanggan-talking-head；见[同步规范](docs/GitHub同步.md)与[100种落地进度](research/100-style-production/README.md)。

成片另交付独立“正式画风总览”：完成视频、封面、配方与证据均使用相对文件，可点击在线播放、跳转和对比，不依赖研究端口。插件源包保留可重建模板和统一fixture；批量MP4保存在成片总览目录，不塞进Git依赖缓存。

当前库：100种已实现（20用户认可，80制作验证），本批100种全部完成。`styles --status implemented`查询可用实现，`--status approved`仅查询用户认可，`--status production`仅查询制作验证。`--example approved`为兼容沿用的固定素材复现命令，两类已实现模板均可使用，不表示都获用户逐条视觉认可。

## 编排接入与完整视频验证

[12套编排与模块协作](docs/编排库与协作.md) · [正式接入验证](docs/1.14.0验收.md)。`choreographies`查询12套完整规则；`recipe --style A04 --composition C05 --kind comparison`比较主搭配与候选；`init --project 新目录 --example approved --style A04 --composition auto`复现本轮主编排。旧命令不加composition仍复现旧版。

新素材用`init --project 新目录 --source 视频 --style A04 --composition C05`，记录搭配后由四个完整模块完成本片语义与时间轴。新版100个主搭配均完成完整视频与原声核验：88条新渲染，12条同源码新版代表片复用并重新核验；不是100×12任意组合验收。原有整片与原生证据分别保留。详见[1.15.0完整视频验收](docs/1.15.0验收.md)。当前无新增配乐、音效或源片重剪；原有14/14/10/10四项配方数量保持。
