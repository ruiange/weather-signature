import { requestLogs } from '../db/schema.js';

export default function createRequestLogMiddleware(db) {
    return async (req, _res, next) => {
        try {
            await db.insert(requestLogs).values({
                method: req.method,
                url: req.originalUrl,
                ip: req.clientIP || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown'
            });
        } catch {
            console.error('请求日志写入失败。');
        }
        next();
    };
}
