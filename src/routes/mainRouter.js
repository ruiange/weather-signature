import express from "express";
import {getWeatherImg} from "../controller/mainController.js";

const mainRouter = express.Router();
mainRouter.all("/", getWeatherImg);
export default mainRouter;