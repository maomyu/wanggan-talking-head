# 网感口播 1.10.0

正式本地插件，包含74种已实现画风（20用户认可、54制作验证）、四个完整专业skill和一个整片统筹入口。100种创意目录分10个家族；其中另外26种尚未完成，分别标记候选或制作中。人物保持原色、角落正圆窗、字幕上移。

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



当前库：74种已实现（20用户认可，54制作验证），26种未完成。`styles --status implemented`查询可用实现，`--status approved`仅查询用户认可，`--status production`仅查询制作验证。`--example approved`为兼容沿用的固定素材复现命令，两类已实现模板均可使用，不表示都获用户逐条视觉认可。
