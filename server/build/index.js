"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./routes/api"));
const auth_1 = __importDefault(require("./routes/auth"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
process.env['ACCESS_TOKEN_SECRET'] =
    'ca4284096d0d082f5c5ab2f8e9ebff17b40f0468ece9ecd46dfaa38e2f8b5d6dff0a0ddc1b123330fd9be5cc2cc8cb7a2d87d02bb043a5b20ecb539ecec90ca5';
process.env['REFRESH_TOKEN_SECRET'] =
    '1db59e12fba9f8198ebda2a204730ee3d79e2884f7f18d9e4523f2e5489893fbde9218133a1d26fd5a47cff0cf5d587a607e5a6c366c07e2fc30aff2b3529bd2';
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use((0, cookie_parser_1.default)());
app.use('/api', api_1.default);
app.use('/auth', auth_1.default);
app.use((_req, res) => {
    res.status(404).json({
        message: 'Endpoint does not exist',
    });
});
app.listen(8080);
