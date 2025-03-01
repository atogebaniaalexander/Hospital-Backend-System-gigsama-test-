"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Helpers_1 = require("../Helpers");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const API_AUTH_STRATEGY = "API";
const adminPlugin = {
    name: "doctor",
    dependencies: ["prisma", "hapi-auth-jwt2", "email"],
    register: async function (server) {
        if (!process.env.JWT_SECRET) {
            server.log("warn", "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it.");
        }
        server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
            key: JWT_SECRET,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: Helpers_1.adminValidateAPIToken,
        });
        server.auth.default(API_AUTH_STRATEGY);
        server.route([]);
    }
};
exports.default = adminPlugin;
//# sourceMappingURL=Admin.js.map