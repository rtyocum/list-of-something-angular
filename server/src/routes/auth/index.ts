import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../..';

const authRouter = Router();

authRouter.post('/token', async (req, res) => {
    try {
        if (!req.cookies.jwt) throw Error('No token exists');
        const isToken = await prisma.token.findFirst({
            where: { token: req.cookies.jwt },
        });
        if (!isToken) throw Error('Token is not valid');
        const user = jwt.verify(
            req.cookies.jwt,
            process.env['REFRESH_TOKEN_SECRET'] as string
        );
        const currentUser = await prisma.user.findUnique({
            where: { id: (user as any).id },
        });
        if (!currentUser) throw Error('No user exists for this token');
        const access_token = jwt.sign(
            {
                id: currentUser.id,
                permissionLevel: currentUser.permissionLevel,
            },
            process.env['ACCESS_TOKEN_SECRET'] as string,
            {
                expiresIn: 21600,
            }
        );
        if (!access_token) throw Error('Failed to sign token');
        res.json({
            access_token,
            user: {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                permissionLevel: currentUser.permissionLevel,
            },
        });
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
});

authRouter.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password)
            throw Error('Missing parameters');
        const currentUser = await prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (!currentUser) throw Error('Invalid Credentials');
        const match = await bcrypt.compare(
            req.body.password,
            currentUser.password
        );
        if (!match) throw Error('Invalid Credentials');

        const access_token = jwt.sign(
            {
                id: currentUser.id,
                permissionLevel: currentUser.permissionLevel,
            },
            process.env['ACCESS_TOKEN_SECRET'] as string,
            {
                expiresIn: 21600,
            }
        );
        if (!access_token) throw Error('Failed to sign token');

        const refresh_token = jwt.sign(
            { id: currentUser.id },
            process.env['REFRESH_TOKEN_SECRET'] as string
        );
        if (!refresh_token) throw Error('Failed to sign token');
        await prisma.token.create({ data: { token: refresh_token } });
        res.cookie('jwt', refresh_token, {
            path: '/auth',
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        });
        res.json({
            access_token,
            user: {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                permissionLevel: currentUser.permissionLevel,
            },
        });
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
});

authRouter.post('/logout', async (req, res) => {
    try {
        if (req.cookies.jwt) {
            res.clearCookie('jwt', { path: '/auth' });
            await prisma.token.delete({ where: { token: req.cookies.jwt } });
        }
        res.json({
            message: 'Logged out',
        });
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
});

authRouter.post('/register', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password)
            throw Error('Missing parameters');

        const currentUser = await prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (currentUser) throw Error('User already exists');

        const salt = await bcrypt.genSalt(10);
        if (!salt) throw Error('bcrypt failed');

        const hash = await bcrypt.hash(req.body.password, salt);
        if (!hash) throw Error('Failed to hash the password');

        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hash,
                permissionLevel: 4,
            },
        });

        const access_token = jwt.sign(
            { id: user.id, permissionLevel: user.permissionLevel },
            process.env['ACCESS_TOKEN_SECRET'] as string,
            {
                expiresIn: 21600,
            }
        );
        if (!access_token) throw Error('Failed to generate a token');

        const refresh_token = jwt.sign(
            { id: user.id },
            process.env['REFRESH_TOKEN_SECRET'] as string
        );
        if (!refresh_token) throw Error('Failed to sign token');
        await prisma.token.create({ data: { token: refresh_token } });
        res.cookie('jwt', refresh_token, {
            path: '/auth',
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        });

        res.json({
            access_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                permissionLevel: user.permissionLevel,
            },
        });
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
});

export default authRouter;
