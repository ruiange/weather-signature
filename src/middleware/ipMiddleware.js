
const ipMiddleware = (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.ip || 'Unknown';
    req.clientIP = `${clientIP} (Detected by middleware)`;
    next();
};

export default ipMiddleware;
