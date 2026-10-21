# 网感口播正式插件

先读skills/talking-head-video/SKILL.md及当前任务对应完整模块，并执行docs/共同制作规范.md。四个专业提示词保留全文；正文完整性见module-manifest.json。新作品放插件外独立项目；单模块修改另存版本。依赖只放runtime；先doctor。画风库见style-library/catalog.json。新增画风保留已有条目与验证状态。样例只用于明确的复现，不能将样例财经文案套给新素材。用户的后续指令优先。

新片执行docs/新素材制作流程.md；素材默认使用用户自己的口播与原声，按docs/素材与原声.md选择，不因最近做过第三方研究就沿用别人的人物、声音或文案。没有可用自有素材时请用户提供，不自行找他人口播替代。

仓库同步：用户已授权将本插件及时同步到GitHub私有仓库maomyu/wanggan-talking-head。每批经真实检查的更新后提交并推送，推送前确认origin对应此私有仓库。四个专家正文保持原哈希。研究进度与可重建源码可进入research，正式styles只登记实际通过的实现；依赖、临时帧、渲染缓存、密钥和未请求的其他项目不入库。

1.18.0起先读docs/分类与配方.md与skills/talking-head-composition/SKILL.md。十一类职责见registry/axes.json；母画风、分支、组件分别登记，旧100项只作兼容映射。新素材init --recipe后先设计本片内容，不能直接套原案例。十一类与原四专家共存，四专家正文原哈希保持。
