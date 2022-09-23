"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../../models/user"));
const token_1 = __importDefault(require("../../models/token"));
const authRouter = (0, express_1.Router)();
authRouter.post('/token', async (req, res) => {
    try {
        if (!req.cookies.jwt)
            throw Error('No token exists');
        const isToken = await token_1.default.findOne({ token: req.cookies.jwt });
        if (!isToken)
            throw Error('Token is not valid');
        const user = jsonwebtoken_1.default.verify(req.cookies.jwt, process.env['REFRESH_TOKEN_SECRET']);
        console.log(user);
        const currentUser = await user_1.default.findOne({ _id: user.id });
        console.log(currentUser);
        if (!currentUser)
            throw Error('No user exists for this token');
        const access_token = jsonwebtoken_1.default.sign({ id: currentUser._id, permissionLevel: currentUser.permissionLevel }, process.env['ACCESS_TOKEN_SECRET'], {
            expiresIn: '15m',
        });
        if (!access_token)
            throw Error('Failed to sign token');
        res.json({
            access_token,
            user: {
                id: currentUser._id,
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
        const currentUser = await user_1.default.findOne({ email: req.body.email });
        if (!currentUser)
            throw Error('Invalid Credentials');
        const match = await bcrypt_1.default.compare(req.body.password, currentUser.password);
        if (!match)
            throw Error('Invalid Credentials');
        const access_token = jsonwebtoken_1.default.sign({ id: currentUser._id, permissionLevel: currentUser.permissionLevel }, process.env['ACCESS_TOKEN_SECRET'], {
            expiresIn: '15m',
        });
        if (!access_token)
            throw Error('Failed to sign token');
        const refresh_token = jsonwebtoken_1.default.sign({ id: currentUser._id }, process.env['REFRESH_TOKEN_SECRET']);
        if (!refresh_token)
            throw Error('Failed to sign token');
        await new token_1.default({ token: refresh_token }).save();
        res.cookie('jwt', refresh_token, {
            path: '/auth',
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        });
        res.json({
            access_token,
            user: {
                id: currentUser._id,
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
            await token_1.default.findOneAndDelete({ token: req.cookies.jwt });
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
        const currentUser = await user_1.default.findOne({ email: req.body.email });
        if (currentUser)
            throw Error('User already exists');
        const salt = await bcrypt_1.default.genSalt(10);
        if (!salt)
            throw Error('bcrypt failed');
        const hash = await bcrypt_1.default.hash(req.body.password, salt);
        if (!hash)
            throw Error('Failed to hash the password');
        const user = new user_1.default({
            name: req.body.name,
            email: req.body.email,
            password: hash,
        });
        const savedUser = await user.save();
        const access_token = jsonwebtoken_1.default.sign({ id: savedUser._id, permissionLevel: savedUser.permissionLevel }, process.env['ACCESS_TOKEN_SECRET'], {
            expiresIn: 3600,
        });
        if (!access_token)
            throw Error('Failed to generate a token');
        const refresh_token = jsonwebtoken_1.default.sign({ id: savedUser._id }, process.env['REFRESH_TOKEN_SECRET']);
        if (!refresh_token)
            throw Error('Failed to sign token');
        await new token_1.default({ token: refresh_token }).save();
        res.cookie('jwt', refresh_token, {
            path: '/auth',
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        });
        res.json({
            access_token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                permissionLevel: savedUser.permissionLevel,
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
