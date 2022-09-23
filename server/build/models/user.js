"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    permissionLevel: {
        type: Number,
        default: 0,
    },
    date: {
        type: Number,
        default: Date.now(),
    },
});
const User = (0, mongoose_1.model)('user', UserSchema);
exports.default = User;
