import './config/env.js';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createDb } from './config/dbConfig.ts.js';
import { createMainRouter } from './routes/mainRouter.js';
import ipMiddleware from './middleware/ipMiddleware.js';
import createRequestLogMiddleware from './middleware/requestLogMiddleware.js';
import createLimiter from './middleware/limiterMiddleware.js';

const outputDirectory = fileURLToPath(new URL('../output/', import.meta.url));

function configuredProxyHops(env) {
    if (env.TRUST_PROXY_HOPS !== undefined && env.TRUST_PROXY_HOPS !== '') {
        if (!/^(?:0|[1-9]|1[0-6])$/.test(env.TRUST_PROXY_HOPS)) {
            throw new Error('TRUST_PROXY_HOPS 必须是 0 到 16 的整数。');
        }
        return Number(env.TRUST_PROXY_HOPS) || false;
    }
    // These runtime markers are supplied by the hosting platform, not an HTTP header.
    return env.FLY_APP_NAME || env.VERCEL === '1' ? 1 : false;
}

export function createApp({
    env = process.env,
    weatherService,
    outputPath = outputDirectory,
    makeDb = createDb
} = {}) {
    const app = express();
    app.set('trust proxy', configuredProxyHops(env));
    app.disable('x-powered-by');
    app.use('/images', express.static(outputPath));
    app.use(createLimiter());
    app.use(ipMiddleware);
    if (env.DATABASE_URL) app.use(createRequestLogMiddleware(makeDb(env.DATABASE_URL)));
    app.use(createMainRouter({ weatherService, isVercel: env.IS_VERCEL === 'true' }));
    return app;
}

const app = createApp();
export default app;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`天气签名服务已启动：http://localhost:${port}`);
    });
}
