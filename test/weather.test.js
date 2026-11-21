import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { normalizeIP } from '../src/middleware/ipMiddleware.js';
import { createWeatherService } from '../src/services/mainService.js';

const fixture = {
    code: 200,
    result: {
        weatherimg: 'duoyun.png', real: '20°C', humidity: 60, wind: '东风', windsc: '2级',
        quality: '良 & <测试>', province: '北京', area: '东城区', weather: '多云'
    }
};

async function serve(t, app) {
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
    }));
    return new URL(`http://127.0.0.1:${server.address().port}/`);
}

function weather(outputDirectory, calls) {
    return createWeatherService({
        http: {
            async get(_url, options) {
                calls.push({ city: options.params.city, timeout: options.timeout });
                return { data: fixture };
            }
        },
        now: () => new Date('2026-01-01T00:00:00Z'),
        outputDirectory
    });
}

test('未配置数据库即可用，真实渲染 PNG，JSON 首次自动建目录且链接可读取', async t => {
    const dir = await mkdtemp(join(tmpdir(), 'weather-test-'));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const outputPath = join(dir, 'not-created');
    const calls = [];
    const app = createApp({
        env: {},
        makeDb: () => assert.fail('日志未启用，不应初始化数据库'),
        weatherService: weather(outputPath, calls),
        outputPath
    });
    const origin = await serve(t, app);
    const imageResponse = await fetch(new URL('?city=%E5%8C%97%E4%BA%AC&type=img', origin));
    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get('cache-control'), 'private, no-store');
    assert.match(imageResponse.headers.get('content-type'), /^image\/png/);
    const image = Buffer.from(await imageResponse.arrayBuffer());
    const meta = await sharp(image).metadata();
    const background = await sharp(await readFile(new URL('../public/images/bg.png', import.meta.url))).metadata();
    assert.deepEqual([meta.format, meta.width, meta.height], ['png', background.width, background.height]);

    const jsonResponse = await fetch(new URL('?city=%E5%8C%97%E4%BA%AC&type=json', origin));
    assert.equal(jsonResponse.status, 200);
    const { url } = await jsonResponse.json();
    assert.match(url, /\/images\/weather\/[0-9a-f-]{36}\.png$/);
    assert.equal(new URL(url).origin, origin.origin);
    const [filename] = await readdir(join(outputPath, 'weather'));
    assert.ok(filename);
    const served = await fetch(url);
    assert.equal(served.status, 200);
    assert.deepEqual(Buffer.from(await served.arrayBuffer()), await readFile(join(outputPath, 'weather', filename)));
    assert.deepEqual(calls, [{ city: '北京', timeout: 8000 }, { city: '北京', timeout: 8000 }]);
});

test('Vercel JSON 只响应一次，单次上传 PNG，不额外使用本地文件', async t => {
    const writes = [];
    const errors = [];
    const weatherService = createWeatherService({
        http: { get: async () => ({ data: fixture }) },
        upload: async (buffer, key) => {
            writes.push({ buffer, key });
            return 'https://example.test/storage/' + key;
        }
    });
    const app = createApp({ env: { IS_VERCEL: 'true', VERCEL: '1' }, weatherService });
    app.use((error, _req, res, _next) => {
        errors.push(error);
        if (!res.headersSent) res.sendStatus(500);
    });
    const origin = await serve(t, app);
    const response = await fetch(new URL('?type=json', origin));
    assert.equal(response.status, 200);
    const body = await response.json();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(errors.length, 0);
    assert.equal(writes.length, 1);
    assert.deepEqual(Object.keys(body), ['url']);
    assert.equal(body.url, 'https://example.test/storage/' + writes[0].key);
    assert.match(writes[0].key, /^weather\/[0-9a-f-]{36}\.png$/);
    assert.equal((await sharp(writes[0].buffer).metadata()).format, 'png');
});

test('天气服务不可用保留 5000 响应，未指定城市且是 IPv6 时回退北京', async t => {
    const calls = [];
    const service = createWeatherService({
        http: { async get(_url, options) {
            calls.push(options.params.city);
            throw new Error('TEST ONLY - do not leak upstream error details');
        } }
    });
    assert.deepEqual(await service({ ip: '2001:db8::1', os: '测试', browser: '测试' }), { code: 5000, message: '天气查询失败' });
    assert.deepEqual(calls, ['北京']);
    const origin = await serve(t, createApp({ env: {}, weatherService: service }));
    const response = await fetch(new URL('?type=json&city=TEST', origin));
    assert.deepEqual(await response.json(), { code: 5000, message: '天气查询失败' });
    assert.deepEqual(calls, ['北京', 'TEST']);
});

test('IP 归一化保留有效 IPv4 / IPv6；默认反代关闭，5 次请求后仍限流', async t => {
    assert.equal(normalizeIP('::ffff:192.0.2.1'), '192.0.2.1');
    assert.equal(normalizeIP('2001:db8::1'), '2001:db8::1');
    assert.equal(normalizeIP('garbage'), '');
    assert.equal(normalizeIP('192.0.2.1, 192.0.2.2'), '');
    const seen = [];
    const app = createApp({ env: {}, weatherService: async ({ ip }) => {
        seen.push(ip);
        return { code: 5000, message: 'fixture' };
    } });
    assert.equal(app.get('trust proxy'), false);
    assert.equal(createApp({ env: { TRUST_PROXY_HOPS: '1' } }).get('trust proxy'), 1);
    const origin = await serve(t, app);
    for (let i = 0; i < 5; i++) assert.equal((await fetch(origin)).status, 200);
    assert.equal((await fetch(origin)).status, 429);
    assert.deepEqual(seen, Array(5).fill('127.0.0.1'));
});
