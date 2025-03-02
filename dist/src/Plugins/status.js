"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const Handlers_1 = require("../Handlers");
const API_AUTH_STRATEGY = "PATIENT-JWT";
const statusPlugin = {
    name: "status",
    register: async function (server) {
        server.route([
            {
                // default status endpoint
                method: "GET",
                path: "/api/v1/",
                handler: (_, h) => h.response({ up: true }).code(200),
                options: {
                    auth: false,
                },
            },
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
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "GET",
                path: "/api/v1/logout",
                handler: Handlers_1.logoutHandler,
                options: {
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    }
                }
            }
        ]);
    },
};
exports.default = statusPlugin;
//# sourceMappingURL=status.js.map