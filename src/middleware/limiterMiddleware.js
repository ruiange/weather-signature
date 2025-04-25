import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 分钟
    max: 5, // 最多 5次请求
    message: '请求太频繁，请稍后再试',
    standardHeaders: true, // 返回标准的 RateLimit-* 头部
    legacyHeaders: false,  // 不使用旧的 X-RateLimit-* 头部
 });

 export default limiter;