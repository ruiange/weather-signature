import {UAParser} from "ua-parser-js";
import {getWeatherData} from "../services/mainService.js";

export const getWeatherImg = async (req, res) => {
    const {query, protocol} = req;
    const {type, city} = query;
    const clientIP = req.clientIP || 'Unknown';
    const ip = clientIP.replace(/[^0-9.]/g, '');
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const os = result.os.name ? result.os.name + ' ' + result.os.version : 'Servers';
    const browser = result.browser.name ? result.browser.name + ' ' + result.browser.version : 'WeChat';
    console.log(os, browser);
    console.log(clientIP)
    const isJson = type === 'json';
    const imgData = await getWeatherData({city, ip, os, browser},isJson)
    console.log(imgData)
    if(imgData.code !== 2000){
        res.json(imgData)
        return
    }
    if(isJson){
        if(process.env.IS_VERCEL === 'true'){
            res.json({
                url: imgData.imageUrl,
            })
        }
        res.json({
            url: `${protocol}://${req.headers.host}/images/${imgData.imageUrl}`,
        })
    }else{
        res.set('Content-Type', 'image/png');
        res.end(imgData.imageBuffer)
    }
}