# 浏览量接入

`GET /api/site-views` 只读取 Vercel Web Analytics；它不记录访问，也不创建数据库。

- `total`：此 Vercel 项目从开启 Web Analytics 起累计的生产环境页面浏览量（PV），不是独立访客数，也不是开启前的历史访问量。
- `today`：Asia/Shanghai 当日 00:00 至查询时刻的生产环境页面浏览量。
- 采集、入库和短缓存会带来延迟，不承诺即时加一。
- 前端 `useSiteViews()` 返回 `{ total, today, status }`。缺配置、无权限、上游故障、非法数据或本地 SPA HTML 回退均为 `unavailable`，数字为 `null`。`0` 只接受上游明确返回的真实数字。

## 配置

1. 在目标项目后台确认 Web Analytics 已启用，并在正式站点接入官方 `@vercel/analytics` 采集。开发和 QA 不应触发生产采集。
2. 在 Vercel Production 配置 `VITE_WEB_ANALYTICS_ENABLED=true`；采集仅在正式域名和生产构建运行。Vite 会将 Vercel 提供的公开采集地址配置传给 SDK；未提供时使用官方 `/_vercel/insights` 回退地址。
3. 在 Vercel **服务端环境变量**中配置 `.env.production.example` 的 `SITE_VIEWS_VERCEL_TOKEN`、`SITE_VIEWS_PROJECT_ID`，团队项目还需 `SITE_VIEWS_TEAM_ID`。凭据存为 Production Secret，使用专用的单项目访问 Token；不要复用 CLI 登录凭据，不要加 `VITE_` 前缀，不要提交认证文件，不在聊天发送 token。
4. 保留 `/api/site-views` 的函数路由，避免被 SPA fallback 重写成 `index.html`。
5. 部署后验证脚本、正常访问的采集请求、真实查询结果与页脚数字。未完成配置前，页面应显示 `—`。

普通 `vite dev` / `vite preview` 不执行 Vercel Functions；本地无法提供真实接口时保持不可用即可。不要用随机数、浏览器存储或本机访问次数填充全站浏览量。

## 已核实的限制

2026-10-08 已在原 `personal-website` 项目启用 Hobby 套餐的 Web Analytics。使用项目凭据的真实查询返回 200；团队列表查询返回 403。采集启用前的历史浏览量不能恢复，统计不等同于独立访客数。

累计使用官方 `visits/count`，不传日期参数，读取启用起累计 PV。真实接口验证发现：只传 `until` 会返回 400；传时间范围的 count 会取整到 UTC 日，因此不适合上海今日统计。今日使用 `visits/aggregate` 的 `by=hour`、`limit=100` 和 production 过滤，从上海午夜对应的 UTC 整点查询至当前小时结束边界并求和；校验上游回显范围及每个小时桶。包含当前小时已入库的浏览量，数据会有采集和入库延迟。

## 运行边界

接口只读取上述三个服务端环境变量，不读取本地文件、浏览器数据、IP 或请求正文。凭据只发送给固定的 Vercel API 域名，不允许重定向；公开响应仅包含两个聚合数字、状态、日期与更新时间。日志只记录路由、结果类别与耗时，不记录凭据或上游响应。

客户端官方 SDK 向本站的 Vercel 采集路由发送去除参数和章节锚点的 URL、时间、SDK 信息及来源页；平台据请求生成匿名访问和设备、地区统计。本网站不调用身份标识 API，并在构造采集载荷前清除 SDK 自身的 `__va_attribution` 存储键，其他浏览器存储不变；清除失败则取消采集。开发、预览域名和章节 hash 切换不增加 PV。

成功结果可在共享缓存保留最多 60 秒，并在上海午夜前到期；失败 `no-store`，上游超时 5 秒。GET 不增加统计，其他方法返回 405。

## 验证

运行 `node --test server/site-views.test.js`。测试中的数字只用于隔离的响应夹具，不进入产品或真实 Analytics。覆盖上海跨日/跨年、请求范围、真实零值、缺失或非法值、403、超时、缓存、只读方法和本地 HTTP 未配置分支。

官方依据：

- [Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api)
- [Counts page views](https://vercel.com/docs/rest-api/web-analytics/counts-page-views)
- [开始采集](https://vercel.com/docs/analytics/quickstart)
