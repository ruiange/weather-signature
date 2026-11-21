### Vercel 部署

1. 在 Vercel 导入此仓库。选择 Node.js 22 或 24。
2. 设置环境变量 `IS_VERCEL=true` 和 `TIAN_XING_KEY`。
3. 如果需要使用 `?type=json`，将公共 Vercel Blob 存储绑定到项目并设置 `BLOB_READ_WRITE_TOKEN`。普通 PNG 响应不写入 Blob。
4. 只有需要请求日志时才配置 `DATABASE_URL`；首次使用日志前，在有连接权限的环境运行 `npm run init-db`。
