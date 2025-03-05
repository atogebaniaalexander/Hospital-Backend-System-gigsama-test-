"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass",
    },
});
const emailPlugin = {
    name: "email",
    register: async function (server) {
        server.app.transporter = exports.transporter;
        server.route([]);
    },
};
exports.default = emailPlugin;
//# sourceMappingURL=email.js.map