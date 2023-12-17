const express = require('express');
const { getWeatherData } = require('./src/generate');
const path = require('path');
const UAParser = require('ua-parser-js');

const app = express();

app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
    // 使用模板字符串来提高可读性
    req.clientIP = `${clientIP} (Detected by middleware)`;
    next();
});


app.use('/images', express.static('output'));

app.get('/', async (req, res) => {
    const clientIP = req.clientIP || 'Unknown';
    const { query, protocol } = req;
    const ip = clientIP.replace(/[^0-9.]/g, '');
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const queryParameters = {
        ip,
        city: query.city || '',
        os: `${parser.getOS().name} ${parser.getOS().version}` || 'unknown',
        browser: `${parser.getBrowser().name}[${parser.getBrowser().version}]` || 'unknown',
    };
    const imageName = await getWeatherData(queryParameters);
    const imagePath = path.join(__dirname, 'output', imageName);
    const currentDomain = req.get('host');
    const imgUrl = `${protocol}://${currentDomain}/images/${imageName}`;
    if (query.type === 'json') {
        res.json({ imgUrl });
    } else {
        res.sendFile(imagePath);
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`启动成功-${new Date().toLocaleString()}`);
    console.log(`http://localhost:${PORT}`);
});
