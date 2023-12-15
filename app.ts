import sharp from 'sharp';
import {v4 as uuidv4} from 'uuid';
import axios from "axios";

interface queryInfoData {
    real:'',
    humidity:''
}
const color = '#2488B8' //文字颜色
// 读取要合成的图片
const bgImage = sharp('public/images/bg.png');//读取背景图
const image2 = sharp('public/images/dyun.png');
export const mergeImages = async (queryInfo?: queryInfoData) => {
    console.log(queryInfo);
    // 获取图片的信息
    const {width: bgWidth, height: bgHeight} = await bgImage.metadata();//获取背景图宽高 用于定义画布宽高
    // 创建一个空白的Canvas
    const canvas = sharp({
        create: {
            width: bgWidth,
            height: bgHeight,
            channels: 4, // RGBA
            background: {r: 255, g: 255, b: 255, alpha: 0} // 设置背景为透明
        }
    });

    const firstLine = {
        text: `<span foreground="${color}">温度：${queryInfo.real} 湿度: ${queryInfo.humidity}%RH</span>`,
        rgba: true,
        width: 200,
    }

    // 使用数组提供多个图层
    canvas.composite([
        {input: await bgImage.toBuffer(), left: 0, top: 0},
        {input: await image2.toBuffer(), left: 70, top: 50},
        {input: {text: firstLine}, left: 160, top: 70}
    ]);
    // 生成唯一的文件名
    const outputFileName = `output/${uuidv4()}.png`;

    // 输出合成后的图片
    await canvas.toFile('output/output.png');

}


/**
 * 获取天气数据
 */
export const getWeatherData = async (city = '北京') => {
    const {data} =await axios.get('https://apis.tianapi.com/tianqi/index', {
        params: {
            key: '9d146c513697e92404b90a66a3caa9e1',
            city: city,
            type: 1
        }
    })
    mergeImages(data.result)
}
getWeatherData()