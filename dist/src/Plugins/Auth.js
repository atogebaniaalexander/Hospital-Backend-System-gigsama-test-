"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_AUTH_STRATEGY = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const Helpers_1 = require("../Helpers");
const Handlers_1 = require("../Handlers");
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
exports.API_AUTH_STRATEGY = "API-JWT";
const authPlugin = {
    name: "auth",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
        if (!process.env.JWT_SECRET) {
            server.log("warn", "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it.");
        }
        server.auth.strategy(exports.API_AUTH_STRATEGY, "jwt", {
            key: JWT_SECRET,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: Helpers_1.validateAPIToken,
        });
        server.route([
            // login route
            {
                method: "POST",
                path: "/api/v1/login",
                handler: Handlers_1.loginHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: joi_1.default.object({
                            email: joi_1.default.string().email().required(),
                            password: joi_1.default.string().required(),
                            role: joi_1.default.string().valid("patient", "doctor", "admin").required(),
                        }),
                        failAction: (request, err) => {
                            request.log("error", err);
                            throw err;
                        },
                    },
                },
            },
            // logout route
            {
                method: "GET",
                path: "/api/v1/logout",
                handler: Handlers_1.logoutHandler,
                options: {
                    auth: {
                        mode: "required",
                        strategy: exports.API_AUTH_STRATEGY
                    }
                }
            }
        ]);
    }
};
exports.default = authPlugin;
//# sourceMappingURL=Auth.js.map