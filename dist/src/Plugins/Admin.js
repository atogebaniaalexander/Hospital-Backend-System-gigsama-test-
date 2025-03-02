"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const dotenv_1 = __importDefault(require("dotenv"));
const Helpers_1 = require("../Helpers");
const Utils_1 = require("../Utils");
const Handlers_1 = require("../Handlers");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const API_AUTH_STRATEGY = "ADMIN-JWT";
const adminPlugin = {
    name: "admin",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
        if (!process.env.JWT_SECRET) {
            server.log("warn", "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it.");
        }
        server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
            key: JWT_SECRET,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: Helpers_1.adminValidateAPIToken,
        });
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
            // assign patient to a doctor
            {
                method: "POST",
                path: "/api/v1/Admin/assignDoctorToPatient",
                handler: Handlers_1.adminAssignDoctorToPatientHandler,
                options: {
                    pre: [Helpers_1.isUserAdmin],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
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
            }
        ]);
    }
};
exports.default = adminPlugin;
//# sourceMappingURL=Admin.js.map