import express from 'express';
import auth from '../../middleware/auth';
import List from '../../models/list';
import { permissionLevels } from '../auth/permissionLevels';

const itemsRouter = express.Router();


itemsRouter.get('/', async (_req, res) => {
    List.find()
        .sort({ _id: 1 })
        .then((items) => {
            res.json({ list: items });
        });
});

itemsRouter.post(
    '/',
    auth(permissionLevels.write + permissionLevels.admin + permissionLevels.owner),
    async (req, res) => {
        console.log(req.body);
        if (!req.body.item) {
            res.status(400).json({
                message: 'No item supplied',
            });
            return;
        }
        const newItem = new List({
            item: req.body.item,
            createdBy: (req as any).user.id
        });
        const item = await newItem.save();
        res.json(item);
    }
);

itemsRouter.delete(
    '/:id',
    auth(permissionLevels.write + permissionLevels.admin + permissionLevels.owner),
    async (req, res) => {
        const user = (req as any).user;
        if (req.params['id'] === '@all' && user.permissionLevel & (permissionLevels.admin + permissionLevels.owner)) {
            List.deleteMany({}).then(() => {
                res.sendStatus(200);
            });
        }
        else if (req.params['id'] === '@all') {
            res.status(401).json({
                message: 'You do not have permission'
            })
        }
        else {
            List.findById(req.params['id']).then((item) => {
                if (
                    item?.createdBy == user.id ||
                    user.permissionLevel & (permissionLevels.admin + permissionLevels.owner)
                ) {
                    item?.remove();
                    res.json({
                        item,
                    });
                } else {
                    res.status(401).json({
                        message: 'You do not have permission',
                    });
                }
            });
        }
    }
);

export default itemsRouter;
