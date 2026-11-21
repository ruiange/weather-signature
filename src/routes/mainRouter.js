import express from 'express';
import { createWeatherImgHandler } from '../controller/mainController.js';

export function createMainRouter(options) {
    const router = express.Router();
    router.all('/', createWeatherImgHandler(options));
    return router;
}
