import { rateLimit } from 'express-rate-limit';

export default function createLimiter() {
    return rateLimit({
        windowMs: 60 * 1000,
        limit: 5,
        message: '请求太频繁，请稍后再试',
        standardHeaders: true,
        legacyHeaders: false
    });
}
