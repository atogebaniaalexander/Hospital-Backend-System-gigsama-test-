"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const Helpers_1 = require("../Helpers");
const Utils_1 = require("../Utils");
const Handlers_1 = require("../Handlers");
const Auth_1 = require("./Auth");
const adminPlugin = {
    name: "admin",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
        server.route([
            //logs
            {
                method: "PUT",
                path: "/api/v1/logs/{startDate}/{endDate}",
                handler: Utils_1.logsHandler,
                options: {
                    pre: [Helpers_1.isUserAdmin],
                    auth: {
                        mode: "required",
                        strategy: Auth_1.API_AUTH_STRATEGY,
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
            // assign patient to a doctor
            {
                method: "POST",
                path: "/api/v1/Admin/assignDoctorToPatient",
                handler: Handlers_1.adminAssignDoctorToPatientHandler,
                options: {
                    pre: [Helpers_1.isUserAdmin],
                    auth: {
                        mode: "required",
                        strategy: Auth_1.API_AUTH_STRATEGY
                    },
                    validate: {
                        payload: joi_1.default.object({
                            doctorId: joi_1.default.string().required(),
                            patientId: joi_1.default.string().required()
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        }
                    }
                }
            },
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
                        strategy: Auth_1.API_AUTH_STRATEGY
                    }
                }
            }
        ]);
    }
};
exports.default = adminPlugin;
//# sourceMappingURL=Admin.js.map