"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ListSchema = new mongoose_1.Schema({
    item: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    date: {
        type: Number,
        default: Date.now(),
    },
});
const List = (0, mongoose_1.model)('list', ListSchema);
exports.default = List;
