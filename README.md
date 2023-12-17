# weather-signature

#### 简介

一个基于express的天气签名图生成服务，可以让你在网站上显示自己的IP，操作系统，浏览器，当地天气。可以让你在网站上远程调用天气签名图，比如在网站侧栏/弹窗提醒等等...
##### img标签直接调用
```html
<img src="http://localhost:4000" alt="" width="428" height="250" />
```
#### 演示效果

![](doc/output.png)


**<span style="color: #0c3952">真是一场酣畅淋漓的查看天气之旅啊！༼·⍨༽༼·∵༽༼· ͒ ͓ ͒༽༼· ͒ ̶ ͒༽༼·⍢༽༼·⍤༽</span>**

#### 接口形式返回imgUrl

```html
<img src="http://localhost:4000?type=img" alt="" width="428" height="250" />
```

##### 接口形式返回imgUrl
也可以通过接口方式返回JSON

```js
//发起请求
axios.get('http://localhost:4000?type=json')
```
接口返回
```json
{
  "imgUrl": "xxx.xxx.png"
}
```

#### 技术栈   

- [node.js](https://nodejs.org/en/)
- [express](https://expressjs.com/)
- [天行api](https://www.tianapi.com/apiview/72) 



#### 注意事项

- 请在config.json中配置你的api key信息
- [天气预报接口主要天气状态和图标文件名](https://s11.ax1x.com/2023/12/17/pi5KJw6.png)



### 部署
[宝塔部署](doc/bt.md)

[vercel部署](doc/vercel.md)


### 其他
[php版本](https://github.com/muzihuaner/IPCard) 