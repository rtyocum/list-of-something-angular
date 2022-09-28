import express from 'express';
import apiRouter from './routes/api';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

process.env['ACCESS_TOKEN_SECRET'] =
    'ca4284096d0d082f5c5ab2f8e9ebff17b40f0468ece9ecd46dfaa38e2f8b5d6dff0a0ddc1b123330fd9be5cc2cc8cb7a2d87d02bb043a5b20ecb539ecec90ca5';

process.env['REFRESH_TOKEN_SECRET'] =
    '1db59e12fba9f8198ebda2a204730ee3d79e2884f7f18d9e4523f2e5489893fbde9218133a1d26fd5a47cff0cf5d587a607e5a6c366c07e2fc30aff2b3529bd2';

const app = express();
export const prisma = new PrismaClient();

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
