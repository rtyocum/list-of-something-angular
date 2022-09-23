"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TokensSchema = new mongoose_1.Schema({
    token: {
        type: String,
        required: true,
    },
    date: {
        type: Number,
        default: Date.now(),
    },
});
const Tokens = (0, mongoose_1.model)('tokens', TokensSchema);
exports.default = Tokens;
