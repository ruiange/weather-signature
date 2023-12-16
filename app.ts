import express, {Request, Response} from 'express';
import {getWeatherData} from "./src/generate";
import path from 'path';
import UAParser from 'ua-parser-js';
const app = express();


app.use((req: Request, res: Response, next) => {
    const clientIP: string = req.headers['x-forwarded-for'] as string || req.ip;
    req['clientIP'] = clientIP;
    next();
});

// 指定虚拟路径，将 output 目录映射到 /images 路径
app.use('/images', express.static('output'));

app.get('/', async (req: Request, res: Response) => {
    const clientIP: string = req['clientIP'] || 'Unknown';
    const {query, protocol} = req
    const ip = clientIP.replace(/[^0-9.]/g, '') as string;



    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);


    const queryParameters = {
        ip: '114.114.114.114',
        city: query.city as string || '北京',
        os: `${parser.getOS().name} ${parser.getOS().version}` || 'unknown',
        browser: `${parser.getBrowser().name}[${parser.getBrowser().version}]` || 'unknown',
    }


    const imageName = await getWeatherData(queryParameters) as string;
    const imagePath = path.join(__dirname, 'output', imageName);
    const currentDomain = req.get('host');//当前域名
    const imgUrl = `${protocol}://${currentDomain}/images/${imageName}`;
    if (query.type === 'json') {
        res.json({imgUrl});
    } else {
        res.sendFile(imagePath);
    }
});

// ... 添加其他路由和中间件

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
