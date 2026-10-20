# YT Portfolio (Bilingual)

基于 React + Vite 的个人视频作品集站点，风格参考  
`Luxury-Desert-Retreat-Landing-Page-Template` 的叙事与质感（衬线大标题、沙金夜色过渡、电影感首屏）。

## 当前功能

- 中英双语切换（导航按钮切换）
- 首页主标题联动：
  - 中文：`小杨同学`
  - 英文：`YT striver`
- 首页视频滚动控制（scroll scrub）：
  - 不滚动时停在当前帧
  - 向下滚动正放
  - 向上滚动倒放
  - 滚动速度映射到视频时间推进
- 作品卡片区（含视频/GIF 预览）
- 创作流程区
- 联系区 + 邮件入口
- 滚动显隐与分段 reveal 动效

## 关键文件

- [App.tsx](src/App.tsx): 页面结构、双语文案、交互逻辑
- [index.css](src/index.css): 全站视觉风格与动效
- [hero-loop.mp4](public/videos/hero-loop.mp4): 首页滚动控制视频（H.264、30fps、全 I 帧优化版）
- [hero-loop-hevc-original.mp4](public/videos/hero-loop-hevc-original.mp4): 原始 HEVC 源文件备份
- [hero_bg.jpeg](public/images/hero_bg.jpeg): 海报图
- [feature-1.gif](src/assets/feature-1.gif)
- [feature-2.gif](src/assets/feature-2.gif)

## 本地运行

```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 质量检查

```bash
npm run lint
npm run build
```

当前状态：已通过。

## 视频流畅度优化记录（正放/倒放）

已完成两部分优化：

1. 交互逻辑优化（代码）
- 将 `hero` 改为 `sticky` 停靠滚动段（`hero-scrub` + `hero-pin`）
- 由“滚动增量累加”改为“滚动绝对进度 → `video.currentTime` 映射”
- 加入 seek 阈值与自适应平滑，减少抖动和跳帧感

2. 素材编码优化（视频）
- 原始文件：HEVC / 60fps / ~69Mbps（实时 seek 压力较大）
- 优化后：H.264 / 30fps / 全 I 帧 / ~14Mbps / `+faststart`
- 结果文件已替换到 `public/videos/hero-loop.mp4`

本次使用命令（本地编译 ffmpeg 后）：

```bash
ffmpeg -y \
  -i public/videos/hero-loop-hevc-original.mp4 \
  -an \
  -vf "fps=30,scale=1280:-2:flags=lanczos,format=yuv420p" \
  -c:v h264_videotoolbox \
  -profile:v high -level 4.1 \
  -b:v 18M -maxrate 20M -bufsize 36M \
  -g 1 -keyint_min 1 \
  -movflags +faststart \
  public/videos/hero-loop.mp4
```

## 后续可继续优化

- 替换真实作品封面（每个项目独立海报）
- 将作品数据抽离为 JSON/MD，方便增删改
- 接入真实联系渠道（微信/邮箱/社媒）
- 增加作品详情页（幕后拆解、分镜、技术栈）

## 上线控流量（OSS + CDN）

### 1) 前端先切严格模式

1. 复制环境变量模板：
```bash
cp .env.production.example .env.production
```
2. 按需填写：
- `VITE_STRICT_TRAFFIC_MODE=true`：预览只用封面图，不主动拉视频流
- `VITE_OSS_VIDEO_BASE_URL=https://你的CDN域名`
- `VITE_OSS_VIDEO_POSTER_BASE_URL=https://你的CDN域名/封面目录`
- 首页 Hero 视频固定 `preload="auto"`（按当前站点需求保留）
3. 构建：
```bash
npm run build
```

### 2) OSS 必做

1. 桶 ACL 设为 `私有`
2. 只允许 CDN 回源访问（禁止直接 OSS 外链）
3. 如果有客户端直连场景，仅下发短时效签名 URL（1-5 分钟）

### 3) CDN 必做

1. 开启 URL 鉴权（签名）
2. 开启 Referer 白名单防盗链
3. 配置流量封顶 / 带宽封顶 / HTTPS 请求数封顶（超限自动停服，防账单失控）

### 4) 监控告警

1. 费用预算告警（Budget）
2. 异常流量告警（突增阈值）
3. 访问日志留存，按日核查 Top URL / Top IP

## 当前本地版本：60fps 工作室一镜到底

默认页面为工作室连续滚动作品集；前文原版页面与 Hero 优化记录作为历史说明保留。全局目录为 **我、BIM、Blender、旅行、影像、END** 六章，「我」内含欢迎留白、关于我、技能点三个阶段，共八个连续动作区间。

八个源时间区间（秒）依次为：**欢迎 0–4、关于我 4–7.983333、技能点 7.983333–11.983333、BIM 11.983333–23.95、Blender 23.95–29.5、旅行 29.5–39、影像 39–48.083333、END 48.083333–52.083333**。摄影区间完整包含取相机、举眼拍摄、闪光、放低与归位；END 从相机归位后的离桌动作开始。区间采用左端包含、右端不包含，最后实际画面为第 3124 帧 / 52.066667 秒。

页面现在采用**章节触发播放 + 定格阅读**：向下越过阅读区间后，自动正放至下一章的指定姿态；向上越过区间则倒放到上一章的姿态。视频按源时间约1倍速自动推进，无需继续滚轮追帧。过渡后半段目标正文按已解码 `mediaTime` 提前渐显，最多在定格前2.4个源视频秒开始；正文、标题动效与目录一起切换到目标章节。最终姿态仍由解码帧确认，再解锁阅读与控件；中途换向立即撤销原目标的正文预览。MP4微秒时间舍入通过帧内0.833ms寻帧偏移处理，避免落在前一帧。

各章阅读阻尼已改为统一的短距离：视口高度的0.6倍，限制在320–600px，不再随源动画长度增加；只有正文确实超出视口时才追加溢出的阅读高度。1672×988窗口约593px、1366×768窗口约461px。片尾额外预留一屏，保证END阅读距离可滚完。到达定格后，滚轮只消耗阅读距离，背景不继续推进。动画期间忽略同方向的额外竖向滚动并丢弃大幅滚动的越界距离，每次最多前进/后退一章；反方向输入立即从当前帧反向，也支持途中再次改变方向，不积压跳章。阅读期间仍使用原生滚动，保留技能列表的内部滚动和媒体控件交互。

目录、深链接及Top直接定位对应定格帧与章节起点，可打断正在播放的过渡；首次无hash的欢迎页自动播放开场至第234帧。缩放保留章节及阅读进度，页面隐藏暂停播放时钟，媒体弹层关闭后恢复。减少动态/省流量模式保持静帧与自然布局，实时切换也保留当前章；加载与失败回退使用当前目标章静帧。动画始终保持原色和100%透明度；独立常驻的浅色渐变已移除，文字区渐变归到当前正文自身，随正文一起显现。自动播放正文使用基于解码进度的smoothstep淡入，并保留4px轻位移；直达目录仍在目标姿态确认后用650ms显示正文。历史连续追帧与边界渐隐方案见此前验收目录，当前章节播放验收位于 `output/studio-motion/chapter-playback/`。

欢迎页标题保持苹方优先的两行「欢迎来到 / 我的工作室」，使用 React Bits **Blur Text** 逐字从模糊过渡到清晰，保持暖棕文字及无句号。每字间隔 60ms，两行分别在 100ms / 220ms 后开始，淡入结束后停止；离开欢迎阶段卸载动效，返回重新播放。提示为 `Welcome`，箭头在下方相对标题居中，并以 2.4 秒周期轻缓下移；离开欢迎阶段暂停箭头。减少动态或省流量模式显示普通中文标题；标题始终保留单一可访问的 H1 文字。复用 `src/components/BlurText.tsx`，新增可选 `startDelay` 默认 0，旧版页面行为不变，许可在 `BlurText.LICENSE.md`。检查记录在 `output/studio-motion/welcome-blur-text/`；TechText 和 Shuffle 的检查资料保留为历史。 本次构建、相关文件 ESLint、1672×988 桌面与 390×844 手机浏览器检查通过；七个阶段边界的前后衔接共 14 次检查没有切换到静帧。

六个章节正文标题现在为「关于我、技能树、BIM工程案例分享、Blender学习计划、城市逃离计划、光影行纪档案」，采用 React Bits **Particle Text** 粒子聚合入场，深暖棕 `#351d12` 配铜棕 `#8d5431`，无霓虹辉光。阅读稳态只保留当前章节粒子Canvas，聚合收敛后停止绘制；离开时保留原画布散开480ms（最多70ms错峰）并渐隐，完成后卸载，保持标题1.4em高度；快速反向进入取消旧离场并重新聚合，不再切回普通字体；减少动态或省流量时显示普通文字。长标题按容器宽度适配，Canvas 尚未就绪或不可用时，普通文字同样缩放到容器内。右侧目录只显示当前章节简名，其余为可点击圆点，悬停不会再显示左侧章节名。来源及许可保留在 `src/components/ParticleText.tsx` / `ParticleText.LICENSE.md`；检查记录在 `output/studio-motion/chapter-particle-text/`。 本次构建、相关文件 ESLint、1672×988 桌面、390×844 / 320px 手机尺寸及字体等待/Canvas 失败回退检查通过。

背景由完整连续主片转码，保留 **60fps、3125 帧、52.083333 秒**，原始源文件未修改。桌面版本 `public/videos/studio/studio-scroll-1080p.mp4` 为 **26.63 MiB**；不大于 760px 的布局使用 `studio-scroll-720p.mp4`，为 **15.16 MiB**。减少动态效果或省流量模式使用静帧和自然内容高度，不加载背景视频；视频加载失败也退回静帧。

三个视频章节改为 [React Bits Depth Carousel](https://reactbits.dev/components/depth-carousel)，16:9 封面沿纵向立体叠放，设计基准spread为70，使用上、下按钮、右侧圆点或键盘上/下键、Home/End 切换。BIM 四部、Blender 五部、旅行八部均保留，不自动轮播。标题与完整简介保留，底部“播放作品/案例”按钮已移除，通过封面中央按钮播放。电脑端标题、卡片、简介和页码整体上下居中；卡片轨道高不超过 58svh / 520px，并随实际可用宽、高缩小。1672×988视口中主卡约520×292.5px，右侧选择条距主卡16px，并保留24px点击区域。关于我、技能和联系内容同样居中；技能采用可展开二级选项的纵向侧栏。欢迎页保留左下布局。照片改用 Drift Wall。

Depth Carousel 单独异步加载，使用有限 GSAP 转场，切换结束停止更新，退出章节清理动画；减少动态效果时显示普通封面，图片异常时显示标题回退。画廊不拦截整页滚轮和触摸竖向滚动，切换作品/照片不会改变背景时间映射。来源与许可在 `DepthCarousel.tsx` / `DepthCarousel.LICENSE.md`，验收资料位于 `output/studio-motion/depth-carousel/`。旧 Accordion Gallery 和 Morph Slider 记录仅为历史方案。

三个视频章节的作品标题与简介分别按本章最长文本预留自然换行高度，避免切换后总高度变化导致整组重新居中。使用两行 CSS Grid 和不可见、排除读屏的文本占位，随窗口和字体自动调整，不截断文字或增加测量动画。五种电脑窗口中全部17部作品共85次切换、转场逐帧位置及循环返回检查通过，章节标题、轮播、作品标题、简介和页码的最大纵向位移均为0；16:9、spread70和单屏完整显示保留。检查、截图及复现基线位于 `output/studio-motion/video-layout-stability/`。

照片章节采用 [React Bits Drift Wall](https://reactbits.dev/components/drift-wall)，在透明左栏中显示缓慢交错漂移的彩色照片墙，保留全部15张旅拍照片。悬停照片带轻微浮起，点击使用原站相册弹层。只在当前章节、页面可见且没有媒体弹层时运行；打开照片放大时暂停，关闭后恢复自动流转；悬停或焦点不会中断流转，不提供额外暂停按钮。减少动态效果或省流量时使用全部照片的静态缩略图。页面滚轮和触摸竖滑保持原生。源码与许可在 `src/components/DriftWall.*`；检查与预览在 `output/studio-motion/drift-wall/`。Dome Gallery 为已替换的历史方案。Drift Wall 本次构建、相关文件 ESLint、五种桌面尺寸检查通过，静态照片行高与弹层返焦正常。最新版按用户要求先优化电脑端；当前自动流转、照片打开暂停/关闭恢复与悬停焦点续流均实测通过，验收见 `output/studio-motion/drift-wall/interaction-verification.json`，手机优化暂缓。

编辑个人资料与联系入口：`src/App.tsx` 中的 `catalog.about` / `catalog.contacts`；作品与照片目录：`src/data/portfolioCatalog.ts`；八个源帧区间、回退图片、滚动基准与阻尼：`src/data/studioTimeline.ts`。新页面在 `App.tsx` 按 ID 排序：Blender 展示方块领域、迷失竹林、迷失雪山、地铁站、医院长廊，BIM 南京潘窑首位，旅行止马岭首位；共享数据与旧版顺序保留；阅读布局与控制器在 `src/components/StudioPortfolio.*`、`StudioBackground.*` 和 `StudioExperience.tsx`。

当前构建预览：[http://127.0.0.1:4188/](http://127.0.0.1:4188/)，开发入口：[5178](http://127.0.0.1:5178/)。旧版通过 [?view=legacy](http://127.0.0.1:4188/?view=legacy) 按需加载。重启服务可运行 `npm run dev -- --host 127.0.0.1 --port 5178`；构建预览使用 `npm run preview -- --host 127.0.0.1 --port 4188`。

本地视频文件名中 `+` 被编码后无法播放的问题已修复；OSS 解析方式保持原样。**本次连续版构建、相关文件 ESLint、1440×900 桌面和 390×844 手机尺寸浏览器验收已通过。** 验证八段连续前后滚动、停止后收敛、摄影与 END 边界、末帧可达、目录/深链接、较长内容、媒体弹层和减少动态模式。验收记录在 `output/studio-motion/continuous-review/`。尚未执行生产部署；手机真机性能仍需实测。

上一轮电脑端细节检查与预览在 `output/studio-motion/desktop-polish/`：六标题粒子离场与反向回归、原spread120的四种桌面尺寸适配、视频弹层关闭X去掉圆圈均通过。原spread90尺寸检查在 `output/studio-motion/depth-carousel-size/`：四种电脑视口中三章保持16:9、16px选择间距及单屏居中，全部17个作品选择、循环返回首部和播放弹层通过。最新检查在 `output/studio-motion/spread70-photo-close/`：三个视频章节spread统一为70，照片与视频的关闭按钮统一为透明背景的X，保留44px点击区域。当前按用户要求暂停追加手机优化；清晰化仅提供建议，视频文件未处理。


右上角背景音乐改为 [React Bits Wake Slider](https://www.reactbits.dev/micro/wake-slider)：拖动时竖条隆起并留下跟随波形，停止后恢复平直。外层背景、可见边框、模糊与容器阴影已去掉；保留64×48px收起区域和居中图标、257×48px悬停/键盘展开、拖动保持展开及音乐开关。使用 `public/audio/inner-light.mp3`（Inner Light，约9.86MiB），默认开启、35%音量、循环且跨章节不重启；浏览器拒绝自动播放时首次可信点击或按键重试。打开作品视频或隐藏页面暂停，关闭视频或返回页面按开关意愿恢复；照片放大继续音乐。键盘调节、焦点提示与减少动态效果均保留。没有新增依赖或本地存储。构建、相关ESLint、18项桌面功能检查和5项最终焦点检查通过，见 `output/studio-motion/wake-slider/`；原 Elastic Slider 记录在 `output/studio-motion/background-music/`，保留为历史。目前未部署；手机优化仍暂缓。


关于我采用 [React Bits Flip Card](https://www.reactbits.dev/micro/flip-card)：正面使用素材文件夹中的卡通人物头像，右下角显示「小楊同學」；背面保留原色真实证件照与手写签名。点击、左右拖动或Enter/Space可翻面，保留有限弹簧转场、轻微倾斜和暖色阴影，恢复原版随鼠标移动的白色径向光效；无镀膜或照片变色滤镜。卡通PNG为1060×1484，与5:7卡片相同；卡通图白底经内置imagegen移除，网页副本为900×1260透明WebP（约111.7KiB），与真实证件照共用同一暖米色渐变；人物保持原有造型和色调，原素材未修改。早前骑马照片网页副本保留为历史素材。卡片与三项证书、职称并排居中，右侧文字采用自然紧凑布局，资格与职称之间保留18–24px间距；卡片按文字自然高度等比缩小，上下保持对齐；ResizeObserver仅同步尺寸变量，不触发状态重渲染；翻面不改变周围文字位置；停用章节或隐藏页面时停止动画，减少动态效果时直接切换正反面。复用现有Motion依赖；源码和完整许可在 `src/components/FlipCard.*`。原Profile Card源码与验收目录保留为历史。

右侧目录现在包含独立的About、Skills、BIM、Blender、Film、Photo、end七项，仍只显示当前项名称，其余为圆点。文字从15px缩至12px，近端圆点从10px缩至8px，保留64×39px点击区域；鼠标经过或键盘聚焦有620ms的有限弹动，减少动态时停用。欢迎隐藏、关于我从右侧滑入保持原样，Skills可单独定位。五种电脑窗口与20项浏览器检查通过，涵盖两面图片、原色、布局、全部目录、弹动、点击/拖动/快速点击/键盘及动态偏好切换；记录与截图在 `output/studio-motion/flip-card-nav/`。本轮未部署，手机优化仍暂缓。

## 技能分支菜单

技能章节采用 [React Bits Branched Menu](https://reactbits.dev/c/micro/branched-menu) 的弧形树状分支、400ms选中路径绘制、300ms折叠与主干标记。专业技能、软件技能、AI协同技能、运动技能四类同一时刻展开一类；初次进入默认展开专业技能并显示「项目经理经历」的图片和说明，切换一级分类自动显示其首项。二级点击显示对应图文，再次点击当前项关闭图片；鼠标移出当前按钮、图片及连接间隙也关闭，选中分支线保留。Escape或键盘离开技能区关闭图片，折叠菜单的子项为inert且移出Tab顺序。

菜单采用透明背景、浅棕树干和铜棕/灰绿强调色，配图使用暖米色容器。全部元素、阴影与移动限定在左侧min(38vw,650px)内容区，最右边界不超过约43.65vw，避免进入右侧人物区域。内容区固定高度，长列表内部滚动，展开不改变标题位置；减少动态或静态模式取消折叠、描线与配图入场动画。沿用现有Lucide图标，没有新增依赖。

各类分别为2、4、4、6项，不推断等级、熟练度、任职年限或具体奖项名称。AI四项文案按用户授权拟定。数据与图片地址集中在 `src/data/studioSkills.ts`；`public/images/skills/` 中的示意图及现有风景照片可逐项替换。源码在 `src/components/SkillTreePanel.*`，原版来源与完整许可在 `BranchedMenu.LICENSE.md`，官方版本固定为ca44b3f9ee180676a06d7de8ec6bea84cddff85b。

构建与相关ESLint通过；1672×988、1366×768、850×650三个窗口的全部48项技能选择、配图加载、左侧边界、标题稳定、默认项与关闭行为均通过；原生键盘及减少动态检查通过，无运行异常。描线与折叠逐帧检查通过。最新验收记录、原版源码和本地截图在 `output/studio-motion/branched-menu/`。旧侧栏的128项选择检查与历史截图在 `output/studio-motion/skill-sidebar/`；紧凑About布局在 `output/studio-motion/about-compact/`。原背包及三栏/四栏原型在 `output/studio-motion/skill-inventory/` 与 `output/studio-motion/skills-tree/`，均为历史记录。本轮未部署；手机优化仍暂缓。


七个目录入口均按指定姿态定位：About 第441帧（7.35秒，插兜正面）、Skills 第669帧（11.15秒，展开双手）、BIM 第1242帧（20.7秒，指向图纸）、Blender 第1674帧（27.9秒，举起方块）、Film 第2197帧（36.6167秒，手持运动相机与无人机）、Photo 第2665帧（44.4167秒，相机举眼）、end 第3124帧（52.0667秒，人物站在左侧）。六章的静态回退图片同步重提；Photo 使用无闪光的举眼画面。目录点击、首次hash和hashchange共用定位逻辑，以当前章节顶到下一章节顶的实际区间计算像素位置，仅最后end扣除结尾额外视口。该次验收仍使用连续追帧滚动（现已由章节播放取代）。历史记录在 `output/studio-motion/chapter-navigation/`；此前end单章检查保留在 `output/studio-motion/end-anchor/`。五种电脑窗口的目录点击与重复点击、七个首次链接与短hash、刷新、连续滚动、静态回退均通过，浏览器无运行异常。最新统一构建为 `index-sEC3BRzq.js`，未部署。


右下角新增 [React Bits Sling Button](https://reactbits.dev/c/micro/sling-button) 样式的 Top 按钮：36px 圆形主体、64×48px 控件区域，与音量控件同尺寸，右边距34px、下边距28px，采用暖白、浅棕与焦糖色。保留弹性拉动、张力线、蓄力圆弧、松手弹射、粒子与有限回弹；点击及Enter/Space直接返回欢迎开场，拖动不足仅回弹，Escape取消。复用统一章节导航，使滚动位置、hash和背景开场帧同步；不修改章节定格帧或正常滚动逻辑。

控件独立于章节淡入淡出，位于照片/视频原生弹层下方；页面隐藏、手势取消、重复抓握和实时切换减少动态效果时停止旧动画。减少动态模式直接返回顶部。复用既有Motion与Lucide依赖，没有新增依赖、存储或网络请求。源码和完整许可在 `src/components/StudioTopButton.*` / `SlingButton.LICENSE.md`；构建、相关ESLint、五种电脑窗口、七章返回、点击/键盘/拖动/取消/快速重拉、弹层、动态偏好切换及返回后刷新均通过，浏览器没有运行异常。记录和本地截图在 `output/studio-motion/sling-top/`。最新本地统一构建为 `index-Bl98RH9v.js`，未部署。


人物闪卡正面已改为用户提供的「卡通人物.png」，右下角暖白小字「小楊同學」；反面为原真实证件照与签名，原Flip Card翻转、光效和按文字高度排版保留。可访问名称同步为卡通头像/证件照与签名。构建、相关ESLint、1672×988 / 1366×768 / 850×650 的两面图片、姓名位置、等高布局、键盘、减少动态模式及光效检查通过，浏览器没有运行异常。最新记录在 `output/studio-motion/cartoon-flip/`，本地构建为 `index-xZKz8m9r.js` / `index-BmkrZvsE.css`，未部署。


卡通图已移除白底，使用 `public/images/profile/studio-cartoon-cutout.webp`，与透明真人证件照共用 `.flip-card__face` 的同一个暖米色渐变背景。原始素材及上版白底网页副本保留；姓名、签名、Flip Card交互和正文布局不变。内置imagegen的输入、完整提示、生成PNG、网页检查结果和本地截图在 `output/studio-motion/card-background/`。构建、相关ESLint、三种桌面两面背景/透明度、图片/姓名、等高布局、翻面/键盘/减少动态/光效检查通过。最新本地构建为 `index-BmGN085k.js`，未部署。

初版章节播放控制替代连续追帧：下滑自动正放、上滑自动倒放至批准定格，当时在解码确认后才展示正文，并在定格后保留短阅读阻尼距离；快速滚动最多切相邻一章，动画途中可反复换向，目录/深链接/Top直接定位。最新构建为 `index-Cw39yrjf.js`。七章正放与倒放、阅读稳态、途中双重换向、大幅滚动、目录/Top打断、缩放、七个首次深链接、静态模式和照片弹层检查通过，相关ESLint与构建通过。验收、呈现帧采样和截图位于 `output/studio-motion/chapter-playback/`，本次未部署。

上一轮节奏调整将阅读阻尼统一缩短至0.6屏（320–600px），并让正文与定格画面同步650ms渐显。最新构建为 `index-R8lFSMs6.js`；三种电脑尺寸的八章距离、七次正放和七次倒放的逐帧同步检查、技能内部滚动、PageDown/PageUp、缩放、减少动态模式和真实长正文溢出检查通过，相关ESLint与构建通过。记录与截图在 `output/studio-motion/chapter-pacing/`，未部署。

最新显示节奏改为动画后半段提前渐显正文，并去掉播放时全屏泛白。主回归构建 `index-CRX9QoSX.js` 的七次正放与七次倒放逐帧渐显、原色透明度、标题不重启动画、三桌面尺寸、途中换向、目录/Top打断、静态模式与媒体弹层通过。最新构建 `index-Conkv74t.js` 补充长内容预览期间的缩放位移同步。记录与截图在 `output/studio-motion/early-content/`，未部署。


章节渐显频闪修复：ParticleText动态准备阶段不先显示普通文字，完整首帧同步绘制后才显示画布；字体与新尺寸采样期间保留旧画面，同尺寸/DPR通知不重复重建，真正resize沿用当前聚拢时间轴或稳态。2D上下文/采样失败保留普通标题回退。播放中的触控板反向输入按18px累计意图判断（140ms短手势窗口），微小尾部方向抖动不再反复取消渐显；正常滚轮、累计上滑仍能倒放。阅读阻尼距离、内容提前出现时机、批准定格点及背景原色均未改。

复现与回归脚本、逐帧画布/透明度记录和本地截图在 `output/studio-motion/content-flicker/`，旧基线为Da9sqQqF；修复构建CDMr2MY2的13次正反切换无ready画布空白帧、透明度回跳或运行异常。最新构建为 `index-CkNhYV4Q.js` / `index-DawdHKTm.css`，补充防止采样失败后的visibilitychange将普通标题回退覆盖成空画布。最终构建的4次正反重入、滚动抖动/正常换向和8项缩放/回退/减少动态检查通过；相关ESLint与构建通过。仅本地验证，未部署。


轻量页脚（2026-10-06）：累计浏览量、北京时间今日浏览量和固定的最近更新日期放在最后一页最底部，横向单行居中；大数用“万/亿”缩写，悬停可查看精确值。统计只读取真实 Vercel Web Analytics 聚合数据，未配置或无权限时显示“—”，不使用本机计数或示例数字。正式域名才挂载官方 Analytics 采集，开发/QA/预览不采集。服务端凭据仅配置为 SITE_VIEWS_VERCEL_TOKEN / SITE_VIEWS_PROJECT_ID / SITE_VIEWS_TEAM_ID，不使用 VITE_ 前缀；配置与限制见 server/README-site-views.md，10 项服务端测试通过。目前统计授权返回403，真实数据尚未接通，未部署。

联系地址旁新增小型复制图标，保留原 mailto/tel 跳转，复制成功以勾和读屏反馈提示，受限时使用原生复制回退或提示手动选择。按最新要求移除静态浏览效果与设置 UI，统一保留动态章节、标题、卡片、照片墙和 Top；旧的静态偏好不再读取。视频加载或失败时仍保留对应图片回退，避免空画面。此前记录中的静态浏览验收属于历史版本，已被当前动态行为替代。

视频与照片弹层改为纯画面，去掉原底部标题/简介区域；可访问的弹层名称、照片alt与隐藏页码反馈保留。原生视频打开时默认有声，使用浏览器播放控件，视频关闭后恢复背景音乐。照片上/下一张按钮移到视口左右中部，桌面放在照片外侧，小屏放在画面边缘；保持左右方向键、首尾循环、Escape/背景点击关闭与原触发控件返焦。未新增作品信息。三种尺寸媒体检查与最终桌面补验在 output/studio-motion/immersive-media/；联系复制、响应式与统计真实零值的隔离夹具检查在 output/studio-motion/footer-contact/，夹具数字不进入产品。

最新入口行为：每次加载或刷新（包括携带旧章节 hash 的地址）都清除初始章节定位、关闭浏览器滚动恢复，从顶部第 0 帧顺播至 Welcome；浏览器返回缓存文档时也重播开场，并关闭残留媒体弹层。普通切换标签页不重播，进入后的目录、Top 和章节 hash 交互仍可定位，缩放保留当前章节进度。最新本地构建为 `index-CZ8FdsIQ.js` / `index-D8WlLUCq.css`，构建与相关 ESLint 通过。开场原始帧、入口回归和真实媒体弹层 BFCache 返回记录在 `output/studio-motion/entry-reset/`；底部统计四尺寸（1672×988、850×650、390×844、320×700）同排、贴底、无横向溢出与 Top 重叠的最新验证见 `output/studio-motion/footer-contact/bottom-layout-final.json`。未部署。

## 技能文件夹（2026-10-07）

技能章节以 React Bits Folder Float 替代之前的分支菜单和 Flex Carousel。项目业绩及奖项、BIM证书及奖项、软件技能、Ai协同技能、运动技能五个文件夹按错落位置排列；悬停或聚焦时翻开文件夹并浮出预览，可拖动预览，点击文件夹显示其全部内容，默认选中项目业绩及奖项。文件夹、预览和内容区均限制在左侧；桌面内容宽度为 `min(30vw,520px)`，内容较长时内部滚动。离开章节、播放章节动画或隐藏页面时停止物理动画。

共 41 项内容：7 份项目资料、10 份 BIM 资料、12 个软件图标、6 个 AI 图标、6 个运动图标。仅两类项目/证书资料支持点击放大，以侧向旋转展开和收起；原生 dialog 支持方向键、Escape、关闭返焦，图片仍在左侧展示。其他图标不提供放大按钮。展示图片、图标、浮出预览和放大容器均去掉新增背景底板；素材自身的纸张和软件标识配色保留。AI 已移除 Sora，保留 ChatGPT、Claude、ComfyUI、Gemini、Cursor、Codex；AI 和运动固定每行三个。

六个运动图标通过内置 imagegen 分别生成，采用暖米色、橄榄色和铜棕色的微缩装备：跑鞋、泳镜、自行车、山峰与冰镐、徒步背包与双杖、羽毛球拍。全部统一为 256×256 RGBA 透明 PNG，保留比例与透明边缘，合计约 262 KiB；网页副本位于 `public/images/skills/folders/sport/`，相同文件也保存到用户的 `分镜/技能树图片/运动技能/`。完整提示词、原始生成结果路径、输出路径、透明度和 SHA-256 记录在 `output/studio-motion/folder-float/sports-imagegen/generation-manifest.json`。原始用户素材未覆盖；BIM 中六处身份证号码仅在网页衍生图片中遮盖，处理记录在 `output/studio-motion/folder-float/assets/privacy-redactions.json`。

最终本地构建为 `index-o1BRDKiu.js` / `index-Cuol0Vgv.css`，构建与相关 ESLint 通过。1672、1366、850、390、320 宽度检查覆盖透明展示、三列布局、浮出和拖拽边界、长资料内部滚动、放大/关闭返焦；320 宽度下内部滚动 13px 可查看全部两排名称。验收和截图保存在 `output/studio-motion/folder-float/qa/`，素材验证在 `output/studio-motion/folder-float/assets/`。本次仅本地修改，未部署；实际手机性能仍需真机检查。

## 技能包与 Circular Gallery（2026-10-07）

当前章节标题、目录提示和时间线名称统一为「技能包」。图片图库位于上方，Folder Float 文件夹位于下方：第一行项目业绩及奖项、BIM证书及奖项，第二行软件技能、Ai协同技能、运动技能；五种窗口尺寸均保持上二下三。沿用左侧 `min(30vw,520px)` 桌面宽度，图库、文件夹浮出预览及放大图片的实际边界均限制在该区域内。

图库采用 [React Bits Circular Gallery](https://www.reactbits.dev/components/circular-gallery) 的 OGL 弧形位置、倾斜、波纹与惯性循环浏览，复用现有 OGL 依赖。素材保留原比例、原色与透明通道；无新增背景底板，左右各 12% 区域逐渐透明，中央图片、标题和控件清楚可见。支持横向拖动、左右箭头与键盘浏览，纵向滚轮继续驱动章节；所有 41 项素材均可访问，默认首张项目图位于中央。上游源码、出处及许可保存在 `output/studio-motion/skill-circular-gallery/upstream/`，应用组件和许可位于 `src/components/SkillCircularGallery.*`。

项目及 BIM 两类图片保留点击侧向旋转放大、原生弹层翻页、Escape、关闭返焦。放大期间左侧图库与文件夹暂时隐藏，关闭后恢复原位置，避免底层文字和关闭按钮重叠；关闭按钮层级已修正，保证窄窗口中心点击可命中。软件、AI 和运动图标仅浏览，不提供放大操作。首次进入技能章节才加载图库模块及完整项目图片，Welcome 首屏不请求其 3.34 MB 全图。图片加载或尺寸变化时准备静止帧，以参与章节内容的提前渐显；持续 RAF 仅在本章可交互、可见且页面前台时运行，打开弹层或离开章节立即暂停。重复的循环图片共用纹理，卸载释放 GL 资源；WebGL 失败时使用原图与原生控件回退。

本地构建 `index-C7dYtrfa.js` / `index-DDgQYDDY.css` 与相关 ESLint 通过。五尺寸布局、文件夹预览边界、41 项浏览、键盘、拖动防误开、两类图片放大/关闭返焦、图标无放大、横纵滚动范围、Welcome 延迟加载、动画中图片渐显和 RAF 暂停已验证；原生浏览器截图及记录位于 `output/studio-motion/skill-circular-gallery/qa/`。素材和原始文件未改动，本次未部署；手机真机性能仍未测量。

## 技能包 Masonry（2026-10-07）

上方素材展示已由 Circular Gallery 改为 [React Bits Masonry](https://www.reactbits.dev/components/masonry)，保留 GSAP 错落淡入、模糊渐清、逐图加载渐显和轻微悬停缩放。文档按行对齐：项目三列，较高证书占前两行，新增论文奖在底部中间；BIM 四列，新增第二届、第三届江海杯横版奖状叠放在右下。软件在 2–4 列中选择适配后单图最大的排布，AI 和运动固定三列。图片保持原比例、10px 圆角、透明展示区；每组整体适配左区宽高，全部可见，无内部滚动，保留右侧角色动画区域。

图片备注默认隐藏，鼠标悬停或键盘聚焦时以小浮层显示名称与已有说明，移开即隐藏，不占布局高度。项目与 BIM 图片可点击或用键盘放大；放大原图以侧向旋转浮于原界面，底下的图库和上二下三 Folder Float 始终可见，没有独立背景底板或整页蒙版。原生 dialog 保留方向键、箭头翻页、Escape、关闭按钮、留白点击关闭和原控件返焦。图标只能查看备注，不提供放大操作。

本次同步本地新增三张文档，项目共 8 张、BIM 共 9 张、软件 12 个、AI 6 个、运动 6 个，共 41 项。新增文档按 EXIF 方向转正，网页使用 WebP，方形透明缩略图仅供文件夹预览；记录在 `output/studio-motion/skill-refinements/new-documents.json`。保留既有 BIM 证书敏感字段遮挡和用户原始文件。

AI 第六项替换为 GitHub 官方黑色透明标识。六个运动图标通过内置 imagegen 分别重新生成为透明、暖深棕色的抽象人体动作剪影（跑步、游泳、骑行、登山、徒步、羽毛球），以导视符号为风格参考，并非奥运会官方图标；统一 256×256 PNG。新图已另存到用户材料目录，保留旧素材。完整提示词、官方 GitHub 来源、透明度检查和 SHA-256 见 `output/studio-motion/folder-float/assets/pictograms/README.md`。

Masonry 按首次进入技能章节延迟加载，使用已有 GSAP，没有新增依赖或外部图片请求。组件按实际安全区整体缩放，保留图片原比例空间；动画清理不重置已完成坐标，打开和关闭放大层不会将素材归零。组件、许可与未修改的官方源码位于 `src/components/SkillMasonryGallery.*` 和 `output/studio-motion/skill-masonry/upstream/`。仅更新本地预览，未部署。

本地终版 `index-hWFGXPsQ.js` / `index-BNVZNJ1v.css` 构建及相关 ESLint 通过。1672×988、1366×768、850×650、390×844、320×700 五种尺寸下，全部 41 项素材完整显示，项目底行同顶同高、BIM 横图上下排列，无内部滚动或左区溢出；悬停/移走、原生 Tab 键备注与图标点击后移走均通过，备注完整且不改变图片坐标。原图对应、侧向旋转、透明界面、翻页、三种关闭方式和返焦通过 25 次检查；记录与本地截图保存于 `output/playwright/skill-refinements/`。响应式验证使用桌面 Chromium 模拟尺寸，未测真实手机性能。

后续图标与备注微调：软件、AI 和运动图标在原命中区内居中缩小 28%，文档尺寸与行对齐不变，AI/运动仍每行三个。鼠标备注使用指针位置跟随，通常位于指针右侧 10px、下方 14px；接近图库边缘时限位或移到上方，完整内容继续留在左侧安全区。mousemove 通过 ref 和 requestAnimationFrame 每帧最多更新一次位置，移开/点击隐藏，键盘备注沿用素材定位。初入阶段不再对空图片列表调用 GSAP set。当前构建为 `index-BlNa9xJB.js` / `SkillMasonryGallery-DzIxzuz4.js`。

## 结束语与独立手机布局（2026-10-07）

结束页标题改为「谢谢观看」，恢复原网站的「在建筑与数字之间探索表达的边界。」及原 BIM、三维创作、影像叙事、AI 生成与行走思考两段完整结束语。`StudioEnding.css` 仅处理结束页文字列和间距，联系人与底部一行统计保持完整；平板结束页的文字衬托增强，避免自行车、椅子暗部影响阅读。电脑与 Pad 采用本次结束页布局作为冻结基线。

手机样式单独放在 `StudioPhone.css`，只作用于 `max-width:600px`，`601px` 及以上仍使用原章节布局、右侧目录和动效。欢迎页保留全屏开场，其他章节改为上方清晰动画舞台、下方暖纸色正文；正文变宽，About 为紧凑两列并使用已有个人标题和翻卡提示，技能包、视频和照片按手机视口排版。目录改为底部七个名称，Top 与目录并排保留角位，不压住素材；统计仍在最底部一行，位于手机控件上方。矮屏手机压缩轮播高度和区块间距，320px 目录为 Blender 留出稍宽的格位。

手机不挂载粒子标题和重复漂移照片墙，标题沿章节内容渐显；照片使用 15 个唯一缩略图，继续接入原照片放大、左右翻页和关闭返焦。背景保持 720p 动画、各章指定定格帧和正倒放，手机阅读阻尼独立缩短为 `clamp(0.3×viewport,180,280)`，真实长内容溢出仍加入阅读距离。较长正文在下方阅读区正常滚动，顶部动画不被文字侵入；未新增静态浏览模式或依赖。

最终本地构建 `index-Dob0aMFF.js` / `index-gJu68qjc.css` 及相关 ESLint 通过。320×700、390×844、430×932 手机尺寸下，全部 41 项技能素材和 15 张照片完整显示，图标三列、翻卡等高、结束语与联系人完整，目录和 Top 不遮挡内容；320px 视频三章页码在底部目录上方。原生触屏正倒放、提前渐显、短阅读阻尼，以及视频有声、文档放大、照片翻页、关闭返焦与刷新回开场通过。桌面/Pad 的结束页和技能包几何与冻结基线一致，601px 分界维持原布局。最终手机报告和截图在 `output/playwright/studio-phone/root/final-summary.json` 与 `output/playwright/studio-phone/after/summary.json`；冻结比较在 `output/playwright/studio-ending-final/recheck-summary.json`。仅本地更新，未部署；真实手机性能仍需真机检查。

手机动画与正文之间增加底部 48–72px 的暖纸色渐变，逐段平滑过渡至正文底色；只柔化动画下沿，人物主体保持清晰。渐变固定在背景层，视频与定格图共用，不随正文透明度或长内容阅读位移变化。非 Welcome 手机正文移除原随内容移动的遮色层，Welcome 全屏开场、播放进度、内容排版、电脑及 Pad 不变。最新构建 `index-kAcyxmPs.js` / `index-CBgBSivj.css` 通过；320、390、430px 手机的 About/Blender/End、Welcome、播放中和定格时，以及 601px Pad 分界共 13 个检查通过，画面与正文几何未变，无横向溢出或新运行异常。截图及记录在 `output/playwright/studio-phone-soft-edge/summary.json`，未部署。

手机 Welcome 与正文之间改为 900ms 的画面高度缓动，向下收拢至顶部、向上反向展开；欢迎文字以 350ms 淡出，暖纸色边缘在收拢初期以 300ms 提前柔化，展开时延迟淡出，正文继续按已解码动画进度渐入。正文布局高度变量保持固定，因此不会因过渡反复重算章节距离。背景初始默认全屏，目录与 Top 的直接跳转依据现有 `immediate` 参数跳过尺寸缓动，减少动态模式偏好也会关闭新过渡。新样式仅在 600px 及以下生效。最终构建 `index-DVnPIO0z.js` / `index-BujtB8Ir.css`、相关 ESLint 与差异检查通过；320、390、430px 的正倒放、欢迎淡出、正文安全区，以及中途反向、原生模拟触屏、目录、Top、减少动态偏好等 26 项检查通过，边缘精调追加 7 项检查通过。601、1024、1672px 的背景与正文几何和过渡前基线一致，无新运行异常。截图与采样记录位于 `output/playwright/studio-phone-entry-motion/summary.json`；仅更新本地手机预览，未部署，未测真机性能。
