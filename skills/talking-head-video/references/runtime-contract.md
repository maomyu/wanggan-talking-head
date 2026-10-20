# 随包运行合同

默认渲染器HyperFrames0.8.174，依赖树由runtime/package-lock.json固定；GSAP3.14.2与assets/fonts/catalog.json清单中的字体文件固定到本地（当前8个）。Python依赖锁定numpy2.4.4、Pillow12.1.0、fonttools4.62.1。用doctor读取实际状态，不猜测依赖已装好。首次setup可能需要包下载及渲染器浏览器准备，之后素材和字体不依赖渲染时联网。

## HTML与时间

- 顶层root直接位于body，data-composition-id与window.__timelines的键一致，data-width、data-height、data-fps和data-duration明确；root使用100%宽高。
- 注册一个paused的GSAP时间轴；字体就绪后再注册，所有值可由帧号寻址。不要手动play、seek媒体或使用网络、Date.now、定时器和未设种子随机数驱动画面。
- video具有唯一id、class=clip、data-start、data-duration、data-media-start。不要把视频嵌在另一个带data-start的普通父节点下。
- 分离原声时video静音，独立audio具有唯一id和明确时间。连续源区间合并，真正不连续处才修接缝；不要同时在video和audio播放人声。
- 人物让位在非计时容器上运动，景别缩放在裁切窗口内部做，不拉伸人物。不要在clip上动画autoAlpha/visibility/display。
- 字体本地固定，检查实际字形覆盖；默认复制未改动字体，不再抽子集。需要额外字形时提供可靠字体，不接受静默回退。
- 所有字幕、动作与剪点从同一输出时间依据读取。源帧与音频采样分别处理，ASR估计不能被称为逐字真值。

## 构建与修改

设计先于HTML。四个完整skill负责判断，runtime不替它们选艺术方向。custom构建脚本要支持--project路径且不依赖固定用户名或历史工作区。素材与字体实体在本项目，不使用指向历史工程的软链接。

run每次按依赖顺序重建并更新原声、字体检查、成片和报告。无实际变化不反复渲染；局部修改另存版本，并检查受保护输入和非剪辑时序。目标目录存在时init/revise拒绝覆盖。

## 检查与交付

最终跑固定CLI check并读错误与警告。若motion.enabled=false，不能把零findings写成全量动效通过。若静态keyframe诊断不能解析辅助函数，使用实际编码抽帧核对，不篡改报告。

render使用固定CLI，输出outputs/final.mp4；verify读取实际编码规格，并将原声与剪辑后PCM参考比较，生成16帧拼版和5fps密集缩略图。比对证明连续性，不证明听感完美，不替代作者实际审看。无独立审片就明确自查，不自称盲评。

预览仅监听127.0.0.1。根路径302到/review.html；MP4支持Range。内置浏览器使用原生video直接显示真实MP4，封面可点击播放，保留播放、进度和全屏控制。预览URL来自实际返回值，不写死端口。

原片、旧版本、已安装插件和外部配置不被修改。本包默认不含发布命令；输出文件留在用户项目。语音识别、图像或声音生成属于外部可选能力，不能为了“完整”暗中调用付费服务。

已声明data-person-travel的模板，由init按目录portraitBase和personTravelSeconds写入真实初始几何及移动时长；构建与附属说明显现读取同一参数。没有声明这项参数的旧模板仍需按本片实现处理，不能把任意字段写入方案便宣称自动生效。调整时长后仍检查路径、阅读窗口、字幕与原声保护。

历史模板保留默认复现。若要改变未声明的人物速度，复现器明确拒绝，交给动效skill在原有单模块保护范围内实现custom构建；不对整段代码的相同小数做全局替换。已声明参数的模板继续支持方案驱动的独立修改。

研究浏览QA另用runtime开发依赖Playwright1.59.1（固定版本）；正式成片渲染仍由HyperFrames执行。研究浏览器首次准备可运行`node runtime/node_modules/playwright/cli.js install chromium`，不再读取花叔或其他技能的安装目录。

1.15.0在检查入口使用运行预算适配器：固定HF0.8.174模块哈希核对后，仅在内存里把整体审计时限从120秒延长到600秒；安装依赖文件、检查规则与动效采样不变。普通timeout只控制首次加载，不能延长内置总时限。每次保存qa/check-budget.json；实际check.ok与motion.samples仍须读取，不把增加时限写成检查通过。Node需支持module.registerHooks（22.15+/23.5+），doctor会实际检查能力；本轮使用23.10.0。
