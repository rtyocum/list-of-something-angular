import express from 'express';
import { prisma } from '../..';
import auth from '../../middleware/auth';
import bcrypt from 'bcrypt';
import { permissionLevels } from '../auth/permissionLevels';

const usersRouter = express.Router();

usersRouter.get(
    '/',
    auth(permissionLevels.admin + permissionLevels.owner),
    async (_req, res) => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                date: true,
                permissionLevel: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
        res.json(users);
    }
);

usersRouter.get(
    '/:id',
    auth(permissionLevels.admin + permissionLevels.owner),
    async (req, res) => {
        if (!req.params['id']) {
            res.status(400).json({
                message: 'Bad Request',
            });
            return;
        }
        const id = Number(req.params['id']);
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                date: true,
                permissionLevel: true,
            },
        });
        res.json(user);
    }
);

usersRouter.post(
    '/',
    auth(permissionLevels.admin + permissionLevels.owner),
    async (req, res) => {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.password ||
            req.body.permissionLevel === undefined
        ) {
            res.status(400).json({
                message: 'Bad Request',
            });
            return;
        }

        try {
            const salt = await bcrypt.genSalt(10);
            if (!salt) throw Error('bcrypt failed');

            const hash = await bcrypt.hash(req.body.password, salt);
            if (!hash) throw Error('Failed to hash the password');
            const user = await prisma.user.create({
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    permissionLevel: req.body.permissionLevel,
                },
            });

            res.json(user);
        } catch (e: any) {
            res.status(500).json({
                message: e.message,
            });
        }
    }
);

usersRouter.put(
    '/',
    auth(permissionLevels.admin + permissionLevels.owner),
    async (req, res) => {
        if (!req.body.id) {
            res.status(400).json({
                message: 'Bad Request',
            });
        }
        const name = req.body.name;
        const email = req.body.email;
        const permissionLevel = req.body.permissionLevel;

        let newPass = null;
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                if (!salt) throw Error('bcrypt failed');

                const hash = await bcrypt.hash(req.body.password, salt);
                if (!hash) throw Error('Failed to hash the password');
                newPass = hash;
            } catch (e: any) {
                res.status(400).json({
                    message: e.message,
                });
                return;
            }
        }
        const newUser = await prisma.user.update({
            where: {
                id: req.body.id as number,
            },
            data: {
                ...(name ? { name } : {}),
                ...(email ? { email } : {}),
                ...(newPass ? { password: newPass } : {}),
                ...(permissionLevel ? { permissionLevel } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                date: true,
                permissionLevel: true,
            },
        });
        res.json(newUser);
    }
);

usersRouter.delete(
    '/:id',
    auth(permissionLevels.admin + permissionLevels.owner),
    async (req, res) => {
        if (!req.params['id']) {
            res.status(400).json({
                message: 'Bad Request',
            });
        }
        const id = Number(req.params['id']);
        const user = await prisma.user.delete({
            where: {
                id,
            },
        });
        res.json(user);
    }
);

export default usersRouter;
