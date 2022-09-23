import express from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';

config();

const app = express();
mongoose.connect(process.env['DB'] as string).catch((err) => {
  console.log(err);
});

interface User {
  id: string;
  permissionLevel: number;
}

declare module 'express' {
  export interface Request {
    user?: User;
  }
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use('/api', apiRouter);
app.use('/auth', authRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({
    message: 'Endpoint does not exist',
  });
});

app.listen(8080);
