import { isIP } from 'node:net';

export function normalizeIP(input) {
    if (typeof input !== 'string') return '';
    const address = input.trim();
    const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    return isIP(mapped?.[1] ?? address) ? (mapped?.[1] ?? address) : '';
}

export default function ipMiddleware(req, _res, next) {
    req.clientIP = normalizeIP(req.ip);
    next();
}
