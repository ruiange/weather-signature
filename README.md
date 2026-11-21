# weather-signature

#### 简介

一个基于express的天气签名图生成服务，可以让你在网站上显示自己的IP，操作系统，浏览器，当地天气。可以让你在网站上远程调用天气签名图，比如在网站侧栏/弹窗提醒等等...

支持vps部署 vercel docker部署;(vercel部署需要配置vercel Blob)

##### img标签直接调用
```html
<img src="https://tq.ruiange.com/" alt="" width="428" height="250" />
```
#### 演示效果

![](https://s11.ax1x.com/2023/12/17/pi5KLhF.png)


**<span style="color: #0c3952">真是一场酣畅淋漓的查看天气之旅啊！༼·⍨༽༼·∵༽༼· ͒ ͓ ͒༽༼· ͒ ̶ ͒༽༼·⍢༽༼·⍤༽</span>**

#### 接口形式返回imgUrl

```html
<img src="https://tq.ruiange.com/?type=img" alt="" width="428" height="250" />
```

##### 接口形式返回imgUrl
也可以通过接口方式返回JSON

```js
//发起请求
axios.get('https://tq.ruiange.com/?type=json')
```
接口返回
```json
{
  "url": "xxx.xxx.png"
}
```

#### 技术栈   

- [node.js](https://nodejs.org/en/)
- [express](https://expressjs.com/)
- [天行api](https://www.tianapi.com/apiview/72) 
- [sharp](https://sharp.pixelplumbing.com/)



#### 注意事项

- 请在`.env`中配置你的[api key](https://www.tianapi.com/apiview/72)（天行api每天可以免费调用1000次）
- [天气预报接口主要天气状态和图标文件名](https://www.tianapi.com/article/164)



### 本地运行与验证

需要 Node.js 22 LTS 或 Node.js 24。Docker 镜像使用 Node.js 22，并监听与 Fly 配置一致的 4000 端口。

```sh
npm ci
cp .env.example .env
npm test
npm start
```

仅需要访问天气接口时配置 `TIAN_XING_KEY` 即可。没有 `DATABASE_URL` 时仍可运行，日志写入是可选项。测试使用合成天气数据，本地验证 PNG、JSON、文件输出及限流，不使用实际 API 凭据。自管反代请根据受控链路配置 `TRUST_PROXY_HOPS`；不要在可直连的服务上信任客户端提交的转发信息。

Blob SDK 固定在 `2.4.0`：后续已核对的版本会引入当前审计告警的传递依赖，待上游修复后再升。

### 部署
[宝塔部署](doc/bt.md)

[vercel部署](doc/vercel.md)


### 其他
[php版本](https://github.com/muzihuaner/IPCard) 