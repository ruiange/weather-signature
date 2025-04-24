
import express from 'express';
import dotenv from 'dotenv';
import mainRouter from "./routes/mainRouter.js";
import ipMiddleware from "./middleware/ipMiddleware.js";
dotenv.config();

const app = express();
app.use('/images', express.static('output'));
app.use(ipMiddleware)
app.use(mainRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`启动成功-${new Date().toLocaleString()}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}?city=北京`)
});