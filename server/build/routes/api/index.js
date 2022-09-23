"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const items_1 = __importDefault(require("./items"));
const users_1 = __importDefault(require("./users"));
const apiRouter = (0, express_1.Router)();
apiRouter.use('/items', items_1.default);
apiRouter.use('/users', users_1.default);
exports.default = apiRouter;
