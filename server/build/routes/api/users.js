"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_1 = __importDefault(require("../../models/user"));
const permissionLevels_1 = require("../auth/permissionLevels");
const userRouter = express_1.default.Router();
userRouter.get('/', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    const users = await user_1.default.find().select('-password');
    res.json(users);
});
userRouter.put('/:id', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    const user = await user_1.default.findById(req.params['id']);
});
exports.default = userRouter;
