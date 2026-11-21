import { UAParser } from 'ua-parser-js';
import { getWeatherData } from '../services/mainService.js';

const label = ({ name, version }, fallback) => name ? [name, version].filter(Boolean).join(' ') : fallback;

export function createWeatherImgHandler({ weatherService = getWeatherData, isVercel = process.env.IS_VERCEL === 'true' } = {}) {
    return async (req, res) => {
        res.set('Cache-Control', 'private, no-store');
        const { type } = req.query;
        const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
        const result = new UAParser(req.get('User-Agent') || '').getResult();
        const os = label(result.os, 'Servers');
        const browser = label(result.browser, 'WeChat');
        const isJson = type === 'json';
        const image = await weatherService({ city, ip: req.clientIP || '', os, browser }, isJson, isVercel);

        if (image.code !== 2000) return res.json(image);
        if (!isJson) return res.type('png').send(image.imageBuffer);
        return res.json({
            url: isVercel ? image.imageUrl : `${req.protocol}://${req.get('host')}/images/${image.imageUrl}`
        });
    };
}
