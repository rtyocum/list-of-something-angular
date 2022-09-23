"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const list_1 = __importDefault(require("../../models/list"));
const permissionLevels_1 = require("../auth/permissionLevels");
const itemsRouter = express_1.default.Router();
itemsRouter.get('/', async (_req, res) => {
    list_1.default.find()
        .sort({ _id: 1 })
        .then((items) => {
        res.json({ list: items });
    });
});
itemsRouter.post('/', (0, auth_1.default)(permissionLevels_1.permissionLevels.write + permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    console.log(req.body);
    if (!req.body.item) {
        res.status(400).json({
            message: 'No item supplied',
        });
        return;
    }
    const newItem = new list_1.default({
        item: req.body.item,
        createdBy: req.user.id
    });
    const item = await newItem.save();
    res.json(item);
});
itemsRouter.delete('/:id', (0, auth_1.default)(permissionLevels_1.permissionLevels.write + permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    const user = req.user;
    if (req.params['id'] === '@all' && user.permissionLevel & (permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner)) {
        list_1.default.deleteMany({}).then(() => {
            res.sendStatus(200);
        });
    }
    else if (req.params['id'] === '@all') {
        res.status(401).json({
            message: 'You do not have permission'
        });
    }
    else {
        list_1.default.findById(req.params['id']).then((item) => {
            if (item?.createdBy == user.id ||
                user.permissionLevel & (permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner)) {
                item?.remove();
                res.json({
                    item,
                });
            }
            else {
                res.status(401).json({
                    message: 'You do not have permission',
                });
            }
        });
    }
});
exports.default = itemsRouter;
