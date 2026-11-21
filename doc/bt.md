### 宝塔部署

1. 下载 Node 项目管理器，并安装 Node.js 22 LTS。项目也支持 Node.js 24。
2. 将代码上传到独立的项目目录，无需上传 `node_modules`。
3. 在项目根目录运行 `npm ci --omit=dev`，并按 `.env.example` 设置环境变量。
4. 在「网站 → Node 项目」添加项目，启动命令使用 `npm start`。宝塔站点端口需与应用的 `PORT` 相同。
5. 只有确认所有流量经过会清理转发头的受控反代，才设置 `TRUST_PROXY_HOPS`。直连时保持不设置。
