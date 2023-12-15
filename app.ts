import sharp from 'sharp';
import {v4 as uuidv4} from 'uuid';

interface queryInfoData {
    text: string,
    width: number,
    height: number,
    left: number,
    top: number,
    rotate: number,
    color: { r: number, g: number, b: number, alpha: number }
}

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
    const newtext = {
        text: '你好',
        width: 100,
        height: 100,
        left: 200,
        top: 200,
        rotate: 0,
        color: {r: 0, g: 0, b: 0, alpha: 255},
        bgColor: {r: 255, g: 255, b: 255, alpha: 0}
    }

    // 使用数组提供多个图层
    canvas.composite([
        {input: await bgImage.toBuffer(), left: 0, top: 0},
        {input: await image2.toBuffer(), left: 70, top: 50},
        {input: {text: newtext}, left: 200, top: 80}
    ]);
    // 生成唯一的文件名
    const outputFileName = `output/${uuidv4()}.png`;

    // 输出合成后的图片
    await canvas.toFile('output/output.png');

}
mergeImages().then(() => {
    console.log('done');
})