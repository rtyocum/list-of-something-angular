"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const __1 = require("../..");
const authRouter = (0, express_1.Router)();
authRouter.post('/token', async (req, res) => {
    try {
        if (!req.cookies.jwt)
            throw Error('No token exists');
        const isToken = await __1.prisma.token.findFirst({
            where: { token: req.cookies.jwt },
        });
        if (!isToken)
            throw Error('Token is not valid');
        const user = jsonwebtoken_1.default.verify(req.cookies.jwt, process.env['REFRESH_TOKEN_SECRET']);
        const currentUser = await __1.prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!currentUser)
            throw Error('No user exists for this token');
        const access_token = jsonwebtoken_1.default.sign({
            id: currentUser.id,
            permissionLevel: currentUser.permissionLevel,
        }, process.env['ACCESS_TOKEN_SECRET'], {
            expiresIn: 21600,
        });
        if (!access_token)
            throw Error('Failed to sign token');
        res.json({
            access_token,
            user: {
                id: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                permissionLevel: currentUser.permissionLevel,
            },
        });
    }
    catch (e) {
        res.status(400).json({
            message: e.message,
        });
    }
});
authRouter.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password)
            throw Error('Missing parameters');
        const currentUser = await __1.prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (!currentUser)
            throw Error('Invalid Credentials');
        const match = await bcrypt_1.default.compare(req.body.password, currentUser.password);
        if (!match)
            throw Error('Invalid Credentials');
        const access_token = jsonwebtoken_1.default.sign({
            id: currentUser.id,
            permissionLevel: currentUser.permissionLevel,
        }, process.env['ACCESS_TOKEN_SECRET'], {
            expiresIn: 21600,
        });
        if (!access_token)
            throw Error('Failed to sign token');
        const refresh_token = jsonwebtoken_1.default.sign({ id: currentUser.id }, process.env['REFRESH_TOKEN_SECRET']);
        if (!refresh_token)
            throw Error('Failed to sign token');
        await __1.prisma.token.create({ data: { token: refresh_token } });
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
    }
    catch (e) {
        res.status(400).json({
            message: e.message,
        });
    }
});
authRouter.post('/logout', async (req, res) => {
    try {
        if (req.cookies.jwt) {
            res.clearCookie('jwt', { path: '/auth' });
            await __1.prisma.token.delete({ where: { token: req.cookies.jwt } });
        }
        res.json({
            message: 'Logged out',
        });
    }
    catch (e) {
        res.status(400).json({
            message: e.message,
        });
    }
});
authRouter.post('/register', async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password)
            throw Error('Missing parameters');
        const currentUser = await __1.prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (currentUser)
            throw Error('User already exists');
        const salt = await bcrypt_1.default.genSalt(10);
        if (!salt)
            throw Error('bcrypt failed');
        const hash = await bcrypt_1.default.hash(req.body.password, salt);
        if (!hash)
            throw Error('Failed to hash the password');
        const user = await __1.prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hash,
                permissionLevel: 4,
            },
        });
        const access_token = jsonwebtoken_1.default.sign({ id: user.id, permissionLevel: user.permissionLevel }, process.env['ACCESS_TOKEN_SECRET'], {
            expiresIn: 21600,
        });
        if (!access_token)
            throw Error('Failed to generate a token');
        const refresh_token = jsonwebtoken_1.default.sign({ id: user.id }, process.env['REFRESH_TOKEN_SECRET']);
        if (!refresh_token)
            throw Error('Failed to sign token');
        await __1.prisma.token.create({ data: { token: refresh_token } });
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
    }
    catch (e) {
        res.status(400).json({
            message: e.message,
        });
    }
});
exports.default = authRouter;
