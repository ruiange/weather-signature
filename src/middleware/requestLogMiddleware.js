import dayjs from 'dayjs';
import { requestLogs } from '../db/schema.js';
import db from '../config/dbConfig.ts.js';

const requestLogMiddleware = async (req, res, next) => {

  try {
    await db.insert(requestLogs).values({
      method: req.method,
      url: req.originalUrl,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });
  } catch (err) {
    console.error('❌ Failed to log request:', err.message);
  }
  next();

};

export default requestLogMiddleware;