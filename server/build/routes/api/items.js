"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const __1 = require("../..");
const auth_1 = __importDefault(require("../../middleware/auth"));
const permissionLevels_1 = require("../auth/permissionLevels");
const itemsRouter = express_1.default.Router();
itemsRouter.get('/', async (_req, res) => {
    const items = await __1.prisma.item.findMany({
        orderBy: {
            date: 'asc',
        },
    });
    res.json({
        list: items,
    });
});
itemsRouter.post('/', (0, auth_1.default)(permissionLevels_1.permissionLevels.write + permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    if (!req.body.item) {
        res.status(400).json({
            message: 'No item supplied',
        });
        return;
    }
    const newItem = await __1.prisma.item.create({
        data: {
            item: req.body.item,
            createdBy: req.user.id,
        },
    });
    res.json(newItem);
});
itemsRouter.delete('/:id', (0, auth_1.default)(permissionLevels_1.permissionLevels.write + permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    if (!req.params['id']) {
        res.status(400).json({
            message: 'Bad Request',
        });
    }
    const user = req.user;
    if (req.params['id'] === '@all' &&
        user.permissionLevel &
            (permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner)) {
        await __1.prisma.item.deleteMany();
        res.sendStatus(200);
    }
    else if (req.params['id'] === '@all') {
        res.status(401).json({
            message: 'You do not have permission',
        });
    }
    else {
        const item = await __1.prisma.item.findUnique({
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
        if (item?.createdBy === user.id ||
            user.permissionLevel &
                (permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner)) {
            await __1.prisma.item.delete({ where: { id: item.id } });
            res.json({
                item,
            });
        }
        else {
            res.status(401).json({
                message: 'You do not have permission',
            });
        }
    }
});
exports.default = itemsRouter;
