"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const __1 = require("../..");
const auth_1 = __importDefault(require("../../middleware/auth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const permissionLevels_1 = require("../auth/permissionLevels");
const usersRouter = express_1.default.Router();
usersRouter.get('/', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (_req, res) => {
    const users = await __1.prisma.user.findMany({
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
});
usersRouter.get('/:id', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    if (!req.params['id']) {
        res.status(400).json({
            message: 'Bad Request',
        });
        return;
    }
    const id = Number(req.params['id']);
    const user = await __1.prisma.user.findUnique({
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
});
usersRouter.post('/', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    if (!req.body.name ||
        !req.body.email ||
        !req.body.password ||
        req.body.permissionLevel === undefined) {
        res.status(400).json({
            message: 'Bad Request',
        });
        return;
    }
    try {
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
                permissionLevel: req.body.permissionLevel,
            },
        });
        res.json(user);
    }
    catch (e) {
        res.status(500).json({
            message: e.message,
        });
    }
});
usersRouter.put('/', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
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
            const salt = await bcrypt_1.default.genSalt(10);
            if (!salt)
                throw Error('bcrypt failed');
            const hash = await bcrypt_1.default.hash(req.body.password, salt);
            if (!hash)
                throw Error('Failed to hash the password');
            newPass = hash;
        }
        catch (e) {
            res.status(400).json({
                message: e.message,
            });
            return;
        }
    }
    const newUser = await __1.prisma.user.update({
        where: {
            id: req.body.id,
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
});
usersRouter.delete('/:id', (0, auth_1.default)(permissionLevels_1.permissionLevels.admin + permissionLevels_1.permissionLevels.owner), async (req, res) => {
    if (!req.params['id']) {
        res.status(400).json({
            message: 'Bad Request',
        });
    }
    const id = Number(req.params['id']);
    const user = await __1.prisma.user.delete({
        where: {
            id,
        },
    });
    res.json(user);
});
exports.default = usersRouter;
