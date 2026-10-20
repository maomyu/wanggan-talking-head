# 编排整片实测 V2

12套基础编排覆盖当前口播的开场、后果、三项并列、双项对照、风险、短句和收束；100种已认可/已实现材料各有明确主搭配。四个完整专家skill继续由正式插件提供，研究代码不把它们缩成模板。

本机对照页：http://127.0.0.1:54556/full-cycle-v2/review.html#films 。封面点击实际MP4；100种目录提供原生时间轴，二者分别标识。完成程度见验证记录.md和各项目当前哈希绑定的QA记录，不从文件夹名称推断验收。

## 入口

`node scripts/studio.mjs systems`查看12套完整规则；`recipe --style A04 --kind comparison`查看主搭配与候选；`apply --from 原工程 --out 独立新版本 --system C05`另存切编排；`delegate --command doctor`等调用正式固定依赖。

整片和局部修改仍读取正式四模块完整skill，依照共同制作规范完成当前片子的真实设计。新素材不会套用本片财经时间线，固定素材适配器通过源哈希保护这一边界。

## 从归档复建

安装/准备正式wanggan-talking-head 1.13.0的固定运行依赖后，用其Python运行：

`python scripts/bootstrap.py --out 一个不存在的独立目录 --style magazine`

`--style all`可复建全部100个原生项目。`WG_PLUGIN_ROOT`可以明确指向正式插件根目录，默认使用当前用户的`plugins/wanggan-talking-head`。归档包含每种设计方案、逐项实际导演源码版本和小型证据；原视频/字体/材料从正式包的明确参考fixture读取。实际复建magazine的原视频、原声、导演代码和HTML四个哈希均与实测工程相同。

需要重渲染时先构建和检查，再渲染并解码验证；变更后的源码不能沿用旧影片的通过记录。`prepare.py`与`expand-100.py`保留本机研究演进过程；干净环境以`bootstrap.py`为复建入口。

## 文件

- library：12套规则、100主搭配、实际源码版本。
- variants：本机实际工程与影片，不进入Git归档。
- scripts：构建、采样、整片编码、解码核验与研究入口。
- plans/modules：本片语义依据和完整研究附录。
- qa：实际本机证据；Git归档中的小型副本存放在evidence。
- revisions：三条局部复修前的可重建源码和真实MP4，保留对照，不作为最终交付。

本轮仍在test，正式1.13.0和安装缓存保留；不宣称100条新版MP4或100×12组合全部验收。作者自查，没有独立盲评。
