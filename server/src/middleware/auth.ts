import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express' {
    export interface Request {
        user?: {
            id: string;
            permissionLevel: number;
        };
    }
}

const auth = (permissionLevel: number) => {
    return (req: Request, res: Response, next: Function) => {
        if (!req.headers.authorization && !req.query['Authorization']) {
            res.status(401).json({
                message: 'No Authorization Header',
            });
            return;
        }
        const token =
            req.headers.authorization?.split(' ')[1] !== undefined
                ? req.headers.authorization?.split(' ')[1]
                : (req.query['Authorization'] as string);
        try {
            if (!token) {
                res.status(400).json({
                    message: 'Bad Auth header',
                });
                return;
            }
            const user = jwt.verify(
                token,
                process.env['ACCESS_TOKEN_SECRET'] as string
            );
            if (!((user as any).permissionLevel & permissionLevel))
                throw Error('You do not have permission');
            req.user = {
                id: (user as any).id,
                permissionLevel: (user as any).permissionLevel,
            };
            next();
        } catch (e: any) {
            res.status(401).json({
                message: e.message,
            });
        }
    };
};

export default auth;
