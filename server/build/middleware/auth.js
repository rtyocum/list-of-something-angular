"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (permissionLevel) => {
    return (req, res, next) => {
        if (!req.headers.authorization && !req.query['Authorization']) {
            res.status(401).json({
                message: 'No Authorization Header',
            });
            return;
        }
        const token = req.headers.authorization?.split(' ')[1] !== undefined
            ? req.headers.authorization?.split(' ')[1]
            : req.query['Authorization'];
        console.log(token);
        try {
            if (!token) {
                res.status(400).json({
                    message: 'Bad Auth header',
                });
                return;
            }
            const user = jsonwebtoken_1.default.verify(token, process.env['ACCESS_TOKEN_SECRET']);
            if (!(user.permissionLevel & permissionLevel))
                throw Error('You do not have permission');
            req.user = {
                id: user.id,
                permissionLevel: user.permissionLevel
            };
            next();
        }
        catch (e) {
            res.status(401).json({
                message: e.message,
            });
        }
    };
};
exports.default = auth;
