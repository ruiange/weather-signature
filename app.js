const express = require('express');
const {getWeatherData} = require('./src/generate');
const path = require('path');
const UAParser = require('ua-parser-js');

const app = express();

app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
    req.clientIP = `${clientIP} (Detected by middleware)`;
    next();
});


app.use('/images', express.static('output'));

app.get('/', async (req, res) => {
    const clientIP = req.clientIP || 'Unknown';  // 获取请求的客户端IP地址，如果获取不到则默认为'Unknown'
    const {query, protocol} = req;  // 解构赋值，从req对象中获取query和protocol属性
    const ip = clientIP.replace(/[^0-9.]/g, '');  // 将clientIP中的非数字和非点号字符替换为空字符串，并将结果赋值给ip变量
    const userAgent = req.get('User-Agent') || '';  // 从req对象中获取'User-Agent'头信息，如果获取不到则默认为空字符串
    const parser = new UAParser(userAgent);  // 创建一个UAParser对象，传入userAgent作为参数，并将结果赋值给parser变量
    const os = `${parser.getOS().name ? parser.getOS().name+" "+parser.getOS().version:'Servers'}`
    const browser = `${parser.getBrowser().name ? parser.getOS().name+" "+parser.getOS().version:'WeChat'}`
    const queryParameters = {
        ip,
        city: query.city || '',
        os,
        browser,
    };
    const generatedData = await getWeatherData(queryParameters);
    let imageName = ''
    if (generatedData.code === 2000) {
        imageName = generatedData.imageUrl
        const imagePath = path.join(__dirname, 'output', imageName);
        const currentDomain = req.get('host');
        const imgUrl = `${protocol}://${currentDomain}/images/${imageName}`;
        if (query.type === 'json') {
            res.json({imgUrl});
        } else {
            res.sendFile(imagePath);
        }
    } else {
        res.json({msg: '生成失败'})
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`启动成功-${new Date().toLocaleString()}`);
    console.log(`http://localhost:${PORT}`);
});
