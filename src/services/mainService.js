import axios from 'axios';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isIPv4 } from 'node:net';
import { fileURLToPath } from 'node:url';
import vercelBlobUpload from '../utils/vercelBlobUtil.js';

const imagesPath = fileURLToPath(new URL('../../public/images/', import.meta.url));
const defaultOutputDirectory = fileURLToPath(new URL('../../output/', import.meta.url));
const fontConfig = {
    fontfile: fileURLToPath(new URL('../../public/font/msyh.ttf', import.meta.url)),
    font: '汉仪帅线体W'
};
const color = '#0c3952';
const tianqiEndpoint = 'https://apis.tianapi.com/tianqi/index';
const captions = { duoyun: 'duoyun.png', xue: 'xue.png', yu: 'yu.png', wu: 'wu.png', mai: 'wu.png',
    sha: 'sha.png', yin: 'yin.png', qing: 'qing.png' };
const assetCache = new Map();
const dateFormat = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Shanghai'
});

function imageAsset(filename) {
    if (!assetCache.has(filename)) {
        const pending = readFile(join(imagesPath, filename)).catch(error => {
            assetCache.delete(filename);
            throw error;
        });
        assetCache.set(filename, pending);
    }
    return assetCache.get(filename);
}

function weatherIcon(icon) {
    const source = typeof icon === 'string' ? icon.toLowerCase() : '';
    const matched = Object.keys(captions).find(key => source.includes(key));
    return matched ? captions[matched] : 'unknow.png';
}

function escapePango(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
    })[character]);
}

function overlayText(value, width, height, left, top, size) {
    const style = size ? ` size="${size}"` : '';
    const text = `<span foreground="${color}"${style}>${escapePango(value)}</span>`;
    return { input: { text: { text, rgba: true, width, height, ...fontConfig } }, left, top };
}

async function renderCard(info, ip, os, browser, now) {
    const [background, weather, ipIcon, browserIcon, locationIcon, osIcon] = await Promise.all([
        imageAsset('bg.png'), imageAsset(weatherIcon(info.weatherimg)), imageAsset('ico/ip.png'),
        imageAsset('ico/bro.png'), imageAsset('ico/local.png'), imageAsset('ico/system.png')
    ]);
    // Use the real background directly instead of decoding it twice and
    // compositing it onto a separate blank canvas.
    return sharp(background).composite([
        { input: weather, left: 40, top: 50 },
        overlayText(`温度：${info.real ?? ''} 湿度: ${info.humidity ?? ''}%RH`, 200, 30, 140, 80),
        overlayText(`风向：${info.wind ?? ''}${info.windsc ?? ''} 空气质量：${info.quality ?? ''}`, 200, 30, 140, 105),
        overlayText(`更新时间：${dateFormat.format(now)}`, 240, 20, 140, 123, 55),
        { input: ipIcon, left: 140, top: 170 },
        overlayText(ip, 100, 20, 160, 173, 45),
        { input: browserIcon, left: 280, top: 170 },
        overlayText(browser, 110, 16, 300, 173, 48),
        { input: locationIcon, left: 140, top: 190 },
        overlayText(`${info.province ?? ''}-${info.area ?? ''}`, 110, 16, 160, 193, 48),
        { input: osIcon, left: 280, top: 190 },
        overlayText(os, 110, 16, 300, 193, 48),
        overlayText(info.weather || '未知', 110, 16, 65, 132, 60)
    ]).png().toBuffer();
}

export function createWeatherService({
    http = axios,
    upload = vercelBlobUpload,
    outputDirectory = defaultOutputDirectory,
    now = () => new Date()
} = {}) {
    return async ({ city, ip, os, browser }, isJson = false, isVercel = process.env.IS_VERCEL === 'true') => {
        const suppliedCity = typeof city === 'string' ? city.trim() : '';
        // The provider accepts cities or IPv4. Preserve the actual IPv6
        // address in the card, and use the existing fallback weather city.
        const queryCity = suppliedCity || (isIPv4(ip) ? ip : '北京');
        const displayIP = ip || '127.0.0.1';
        let data;
        try {
            ({ data } = await http.get(tianqiEndpoint, {
                params: { key: process.env.TIAN_XING_KEY, city: queryCity, type: 1 },
                timeout: 8000
            }));
        } catch {
            return { code: 5000, message: '天气查询失败' };
        }

        if (data?.code !== 200 || !data.result || typeof data.result !== 'object') {
            return { code: 5000, message: '天气查询失败', data, ip: displayIP, os, browser, city };
        }

        try {
            const imageBuffer = await renderCard(data.result, displayIP, os, browser, now());
            if (!isJson) return { code: 2000, imageUrl: '', imageBuffer };

            const imageUrl = `weather/${randomUUID()}.png`;
            if (isVercel) {
                return { code: 2000, imageUrl: await upload(imageBuffer, imageUrl), imageBuffer };
            }
            await mkdir(join(outputDirectory, 'weather'), { recursive: true });
            await writeFile(join(outputDirectory, imageUrl), imageBuffer);
            return { code: 2000, imageUrl, imageBuffer: '' };
        } catch {
            return { code: 5000, message: '天气签名图生成失败' };
        }
    };
}

export const getWeatherData = createWeatherService();
