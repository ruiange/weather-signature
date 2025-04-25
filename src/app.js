
import express from 'express';
import dotenv from 'dotenv';
import mainRouter from "./routes/mainRouter.js";
import ipMiddleware from "./middleware/ipMiddleware.js";
import requestLogMiddleware from "./middleware/requestLogMiddleware.js";
dotenv.config();

const app = express();
app.use('/images', express.static('output'));

app.use(limiter)
app.use(ipMiddleware)

const DATABASE_URL = process.env.DATABASE_URL;
if(DATABASE_URL){
    app.use(requestLogMiddleware);
}
app.use(mainRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`启动成功-${new Date().toLocaleString()}`);
    console.log(`请求示例: http://localhost:${PORT}`);
    console.log(`请求示例：http://localhost:${PORT}?city=%E5%8C%97%E4%BA%AC`)
    console.log(`请求示例：http://localhost:${PORT}?json=type`)
    console.log(`请求示例：http://localhost:${PORT}?city=%E5%8C%97%E4%BA%AC&&json=type`)
});