
const ipMiddleware = (req, res, next) => {
    req.clientIP = req.headers['x-forwarded-for'] || req.ip || 'Unknown'
    next();
};

export default ipMiddleware;
