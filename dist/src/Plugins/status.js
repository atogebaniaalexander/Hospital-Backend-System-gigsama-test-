"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const Helpers_1 = require("../Helpers");
const Utils_1 = require("../Utils");
const API_AUTH_STRATEGY = "API";
const statusPlugin = {
    name: "app/status",
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
                method: "PUT",
                path: "/api/v1/logs/{startDate}/{endDate}",
                handler: Utils_1.logsHandler,
                options: {
                    pre: [Helpers_1.isUserAdmin],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY,
                    },
                    validate: {
                        params: joi_1.default.object({
                            startDate: joi_1.default.string().required(),
                            endDate: joi_1.default.string().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
        ]);
    },
};
exports.default = statusPlugin;
//# sourceMappingURL=status.js.map