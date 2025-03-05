"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailPlugin = {
    name: "email",
    register: async function (server) {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || "localhost",
            port: process.env.SMTP_PORT || "587",
            secure: true,
            auth: {
                user: process.env.SMTP_USER || "user",
                pass: process.env.SMTP_PASS || "pass",
            },
        });
        server.app.transporter = transporter;
        server.route([]);
    },
};
exports.default = emailPlugin;
//# sourceMappingURL=email.js.map