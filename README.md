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

- [App.tsx](/Users/yangtong/Documents/codex/code/src/App.tsx): 页面结构、双语文案、交互逻辑
- [index.css](/Users/yangtong/Documents/codex/code/src/index.css): 全站视觉风格与动效
- [hero-loop.mp4](/Users/yangtong/Documents/codex/code/public/videos/hero-loop.mp4): 首页滚动控制视频（H.264、30fps、全 I 帧优化版）
- [hero-loop-hevc-original.mp4](/Users/yangtong/Documents/codex/code/public/videos/hero-loop-hevc-original.mp4): 原始 HEVC 源文件备份
- [hero_bg.jpeg](/Users/yangtong/Documents/codex/code/public/images/hero_bg.jpeg): 海报图
- [feature-1.gif](/Users/yangtong/Documents/codex/code/src/assets/feature-1.gif)
- [feature-2.gif](/Users/yangtong/Documents/codex/code/src/assets/feature-2.gif)

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
/Users/yangtong/Downloads/ffmpeg-local/bin/ffmpeg -y \
  -i /Users/yangtong/Documents/codex/code/public/videos/hero-loop-hevc-original.mp4 \
  -an \
  -vf "fps=30,scale=1280:-2:flags=lanczos,format=yuv420p" \
  -c:v h264_videotoolbox \
  -profile:v high -level 4.1 \
  -b:v 18M -maxrate 20M -bufsize 36M \
  -g 1 -keyint_min 1 \
  -movflags +faststart \
  /Users/yangtong/Documents/codex/code/public/videos/hero-loop.mp4
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
