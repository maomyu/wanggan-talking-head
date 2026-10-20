# 已认可的连续解释代表片

本目录是1.16.0的有界复现案例，供研究动作、素材和交接怎样配合。正式通用要求见[语义编排与素材协作](../../docs/语义编排与素材协作.md)。不把财经台词、四件物品、八枚筹码、三项建议或固定时间套给新稿。

用户认可与实际交付哈希见[evidence/user-approval.json](evidence/user-approval.json)，编码、原声、人物和浏览器记录同存evidence。原研究指令与参考拆解保留原文；其中“尚未升级”是当时状态。当前正式状态见[1.16.0验收](../../docs/1.16.0验收.md)。大型MP4与原始人像未加入源码包；本地研究工程保留可在线播放最终文件。

plans和assets记录完整决策与真实动作实现，scripts/composition.template生成画面。生活物品为已标注的AI示意，prompt与PNG实体保留，不是事实证据。源码只依赖本包runtime；restore-case.mjs先核对用户提供的原素材哈希，随后通过正式init创建独立工程并恢复本案例。需要已认可的同一源片，不能拿任意视频来复现。

从插件根目录运行（项目路径须不存在）：

```sh
node research/semantic-choreography-20261020/restore-case.mjs --project /absolute/new-project --source /absolute/approved-source.mp4
node scripts/studio.mjs run --project /absolute/new-project
node scripts/studio.mjs preview --project /absolute/new-project
```

restore只恢复本片设计，运行后用标准在线播放页查看最终MP4；它不复制历史输出或通过报告。原A/B研究页与额外浏览器兼容编码仍保存在原研究工程中，不是此精简复现器的交付承诺。
