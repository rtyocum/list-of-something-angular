import express from 'express';
import { prisma } from '../..';
import auth from '../../middleware/auth';
import { permissionLevels } from '../auth/permissionLevels';

const itemsRouter = express.Router();

itemsRouter.get('/', async (_req, res) => {
    const items = await prisma.item.findMany({
        orderBy: {
            date: 'asc',
        },
    });
    res.json({
        list: items,
    });
});

itemsRouter.post(
    '/',
    auth(
        permissionLevels.write + permissionLevels.admin + permissionLevels.owner
    ),
    async (req, res) => {
        if (!req.body.item) {
            res.status(400).json({
                message: 'No item supplied',
            });
            return;
        }

        const newItem = await prisma.item.create({
            data: {
                item: req.body.item,
                createdBy: (req as any).user.id,
            },
        });
        res.json(newItem);
    }
);

itemsRouter.delete(
    '/:id',
    auth(
        permissionLevels.write + permissionLevels.admin + permissionLevels.owner
    ),
    async (req, res) => {
        if (!req.params['id']) {
            res.status(400).json({
                message: 'Bad Request',
            });
        }
        const user = (req as any).user;
        if (
            req.params['id'] === '@all' &&
            user.permissionLevel &
                (permissionLevels.admin + permissionLevels.owner)
        ) {
            await prisma.item.deleteMany();
            res.sendStatus(200);
        } else if (req.params['id'] === '@all') {
            res.status(401).json({
                message: 'You do not have permission',
            });
        } else {
            const item = await prisma.item.findUnique({
                where: {
                    id: isNaN(Number(req.params['id']))
                        ? 0
                        : Number(req.params['id']),
                },
            });
            if (!item) {
                res.status(400).json({
                    message: 'No Item Exists',
                });
                return;
            }
            if (
                item?.createdBy === user.id ||
                user.permissionLevel &
                    (permissionLevels.admin + permissionLevels.owner)
            ) {
                await prisma.item.delete({ where: { id: item.id } });
                res.json({
                    item,
                });
            } else {
                res.status(401).json({
                    message: 'You do not have permission',
                });
            }
        }
    }
);

export default itemsRouter;
