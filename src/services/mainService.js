import sharp from 'sharp';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import path from 'path';
import {fileURLToPath} from 'url';
import vercelBlobUpload from "../utils/vercelBlobUtil.js";
import fs from "fs";

// 模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 统一路径常量
const publicPath = path.join(__dirname, '..', '..', 'public');
const imagesPath = path.join(publicPath, 'images');
const iconsPath = path.join(imagesPath, 'ico');
const fontPath = path.join(publicPath, 'font', 'msyh.ttf');
console.log('📁 是否存在：', fs.existsSync(publicPath));
// 字体配置
const fontConfig = {
    fontfile: fontPath,
    font: '汉仪帅线体W',
};

// 图片资源
const bgImage = sharp(path.join(imagesPath, 'bg.png'));
const ipImg = sharp(path.join(iconsPath, 'ip.png'));
const broImg = sharp(path.join(iconsPath, 'bro.png'));
const localImg = sharp(path.join(iconsPath, 'local.png'));
const systemImg = sharp(path.join(iconsPath, 'system.png'));
// const tipImg = sharp(path.join(iconsPath, 'tip.png'));


const color = '#0c3952';


const mergeImages = async (weatherInfo, IP, os, browser,isJson) => {
    const weatherImgUrl = iconNameConversion(weatherInfo.weatherimg);
    const weatherIcons = sharp(path.join(imagesPath, weatherImgUrl));


   // 获取图片的信息
    const {width: bgWidth, height: bgHeight} = await bgImage.metadata(); // 获取背景图宽高 用于定义画布宽高
    // 创建一个空白的 Canvas
    const canvas = sharp({
        create: {
            width: bgWidth,
            height: bgHeight,
            channels: 4, // RGBA
            background: {r: 255, g: 255, b: 255, alpha: 0}, // 设置背景为透明
        },
    });
    // 第一行文字 温度 适度
    const firstLine = {
        text: `<span foreground="${color}">温度：${weatherInfo.real} 湿度: ${weatherInfo.humidity}%RH</span>`,
        rgba: true,
        width: 200,
        height: 30,
        ...fontConfig,
    };
    // 第二行文字 风向 风力
    const secondLine = {
        text: `<span foreground="${color}">风向：${weatherInfo.wind}${weatherInfo.windsc} 空气质量：${weatherInfo.quality}</span>`,
        rgba: true,
        width: 200,
        height: 30,
        ...fontConfig,
    };
    // 第三行文字 更新时间
    const thirdLine = {
        text: `<span foreground="${color}" size="55">更新时间：${new Date().toLocaleString()}</span>`,
        rgba: true,
        width: 240,
        height: 20,
        ...fontConfig,
    };
    const ipText = {
        text: `<span foreground="${color}" size="45">${IP}</span>`,
        rgba: true,
        width: 100,
        height: 20,
        ...fontConfig,
    };
    const localText = {
        text: `<span foreground="${color}" size="48">${weatherInfo.province}-${weatherInfo.area}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };
    const osText = {
        text: `<span color="${color}" size="48">${os}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };
    const browserText = {
        text: `<span color="${color}" size="48">${browser}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };
    // const tipText = {
    //     text: `<span  size="20" color="${color}" >${weatherInfo.tips}</span>`,
    //     rgba: true,
    //     width: 260,
    //     height: 60,
    //     ...fontConfig,
    // };
    const weatherText = {
        text: `<span foreground="${color}" size="60">${weatherInfo.weather}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };


    try {
        canvas.composite([
            {input: await bgImage.toBuffer(), left: 0, top: 0},
            {input: await weatherIcons.toBuffer(), left: 40, top: 50},
            {input: {text: firstLine}, left: 140, top: 80},
            {input: {text: secondLine}, left: 140, top: 105},
            {input: {text: thirdLine}, left: 140, top: 123},
            {input: await ipImg.toBuffer(), left: 140, top: 170},
            {input: {text: ipText}, left: 160, top: 173},
            {input: await broImg.toBuffer(), left: 280, top: 170},
            {input: {text: browserText}, left: 300, top: 173},
            {input: await localImg.toBuffer(), left: 140, top: 190},
            {input: {text: localText}, left: 160, top: 193},
            {input: await systemImg.toBuffer(), left: 280, top: 190},
            {input: {text: osText}, left: 300, top: 193},
            {input: {text: weatherText}, left: 65, top: 132},
            // {input: await tipImg.toBuffer(), left: 140, top: 210},
            // {input: {text: tipText}, left: 160, top: 212},
        ]);

        const outputFileName = `${uuidv4()}.png`;
        const imageBuffer = await canvas.png().toBuffer();

        if(isJson){
            await canvas.toFile(`output/${outputFileName}`);
            if (process.env.IS_VERCEL === 'true') {
                const blobImgUrl = await vercelBlobUpload(imageBuffer, outputFileName);
                return {imageUrl: blobImgUrl, imageBuffer};
            }
            return {imageUrl: outputFileName, imageBuffer: ''};
        }else{
            return {imageUrl:'', imageBuffer};
        }






    } catch (e) {
        throw e;
    }
};

const iconNameConversion = (icon) => {
    const iconNameMap = {
        xue: 'xue.png',
        yu: 'yu.png',
        wu: 'wu.png',
        mai: 'wu.png',
        sha: 'sha.png',
        yin: 'yin.png',
        duoyun: 'duoyun.png',
        qing: 'qing.png'
    };
    const iconKey = Object.keys(iconNameMap).find(key => icon.includes(key));
    return iconKey ? iconNameMap[iconKey] : 'unknow.png';
};

export const getWeatherData = async ({city, ip, os, browser},isJson=false) => {
    console.log('🚀 ~ getWeatherData ~', {city, ip, os, browser})
    const url = 'https://apis.tianapi.com/tianqi/index';
    const queryCity = city || (ip && (ip !== '1' || !ip.includes('::1')) ? ip : '');
    console.log('🚀 ~ getWeatherData ~', {url, queryCity})
    const {data} = await axios.get(url, {
        params: {
            key: process.env.TIAN_XING_KEY,
            city: queryCity || '北京',
            type: 1,
        },
    });
    if (ip === '1' || !ip) ip = '127.0.0.1';

    if (data.code !== 200) {
        return {
            code: 5000,
            message: '天气查询失败',
            data: data,
            ip,
            os,
            browser,
            city
        };
    }


    try {
        const {imageUrl, imageBuffer} = await mergeImages(data.result, ip, os, browser, isJson);
        return {code: 2000, imageUrl, imageBuffer};
    } catch (error) {
        console.error(error.message);
        return {code: 5000, message: error.message};
    }
};


