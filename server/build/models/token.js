"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
        required: true,
    },
    date: {
        type: Number,
        default: Date.now(),
    },
});
const Token = (0, mongoose_1.model)('token', TokenSchema);
exports.default = Token;
