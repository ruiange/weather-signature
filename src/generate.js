const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const config = require('../config.json');
const color = '#0c3952'; // 文字颜色
const fontConfig = {
    fontfile: 'public/font/msyh.ttf',
    font: '汉仪帅线体W',
};

// 读取要合成的图片
const bgImage = sharp('public/images/bg.png');

const ipImg = sharp('public/images/ico/ip.png');
const broImg = sharp('public/images/ico/bro.png');
const localImg = sharp('public/images/ico/local.png');
const tipImg = sharp('public/images/ico/tip.png');
const systemImg = sharp('public/images/ico/system.png');

const mergeImages = async (weatherInfo, IP, os, browser) => {
    console.log(weatherInfo.weatherimg)
    const weatherIcons = sharp(`public/images/${weatherInfo.weatherimg}`);
    // 获取图片的信息
    const { width: bgWidth, height: bgHeight } = await bgImage.metadata(); // 获取背景图宽高 用于定义画布宽高
    const { width: image2Width, height: image2Height } = await ipImg.metadata();
    // 创建一个空白的 Canvas
    const canvas = sharp({
        create: {
            width: bgWidth,
            height: bgHeight,
            channels: 4, // RGBA
            background: { r: 255, g: 255, b: 255, alpha: 0 }, // 设置背景为透明
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
        text: `<span foreground="${color}">更新时间：${new Date().toLocaleString()}</span>`,
        rgba: true,
        width: 220,
        height: 30,
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
        text: `<span foreground="${color}" size="48">${os}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };
    const browserText = {
        text: `<span foreground="${color}" size="48">${browser}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };
    const tipText = {
        text: `<span  size="20" color="${color}" >${weatherInfo.tips}</span>`,
        rgba: true,
        width: 260,
        height: 60,
        ...fontConfig,
    };
    const weatherText = {
        text: `<span foreground="${color}" size="60">${weatherInfo.weather}</span>`,
        rgba: true,
        width: 110,
        height: 16,
        ...fontConfig,
    };
    // 使用数组提供多个图层
    canvas.composite([
        { input: await bgImage.toBuffer(), left: 0, top: 0 },
        { input: await weatherIcons.toBuffer(), left: 40, top: 50 },
        { input: { text: firstLine }, left: 140, top: 80 },
        { input: { text: secondLine }, left: 140, top: 105 },
        { input: { text: thirdLine }, left: 140, top: 123 },
        { input: await ipImg.toBuffer(), left: 140, top: 170 },
        { input: { text: ipText }, left: 160, top: 173 },
        { input: await broImg.toBuffer(), left: 280, top: 170 },
        { input: { text: browserText }, left: 300, top: 173 },
        { input: await localImg.toBuffer(), left: 140, top: 190 },
        { input: { text: localText }, left: 160, top: 193 },
        { input: await systemImg.toBuffer(), left: 280, top: 190 },
        { input: { text: osText }, left: 300, top: 193 },
        { input: await tipImg.toBuffer(), left: 140, top: 210 },
        { input: { text: tipText }, left: 160, top: 212 },
        { input: { text: weatherText }, left: 65, top: 132 },
    ]);
    // 生成唯一的文件名
    const outputFileName = `${uuidv4()}.png`;
    // 输出合成后的图片
    await canvas.toFile(`output/${outputFileName}`);
    return new Promise((resolve, reject) => {
        resolve(outputFileName);
    });
};

const getWeatherData = async ({ city, ip, os, browser }) => {
    const url = 'https://apis.tianapi.com/tianqi/index';
    const queryCity = city || (ip && ip !== '1' ? ip : '');
    const { data } = await axios.get(url, {
        params: {
            key: config.tianxingKey,
            city: queryCity || '北京',
            type: 1,
        },
    });
    try {
        const imageUrl = await mergeImages(data.result, ip, os, browser);
        console.log('imageUrl')
        return imageUrl;
    } catch (error) {
        // 可以根据需要进行错误处理
        throw error;
    }
};

// 导出函数
module.exports = {
    mergeImages,
    getWeatherData,
};
