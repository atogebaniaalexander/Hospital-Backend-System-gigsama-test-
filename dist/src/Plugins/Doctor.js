"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const dotenv_1 = __importDefault(require("dotenv"));
const Helpers_1 = require("../Helpers");
const Handlers_1 = require("../Handlers");
const Validators_1 = require("../Validators");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const API_AUTH_STRATEGY = "DOCTOR-JWT";
const doctorPlugin = {
    name: "doctor",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
        if (!process.env.JWT_SECRET) {
            server.log("warn", "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it.");
        }
        server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
            key: JWT_SECRET,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: Helpers_1.doctorValidateAPIToken,
        });
        server.route([
            // create a doctor route
            {
                method: "POST",
                path: "/api/v1/Doctor/create",
                handler: Handlers_1.createDoctorHandler,
                options: {
                    pre: [Helpers_1.isUserDoctor],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    },
                    validate: {
                        payload: Validators_1.createDoctorInputValidator,
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            // get all doctors route
            {
                method: "GET",
                path: "/api/v1/Doctors",
                handler: Handlers_1.listDoctorsHandler,
                options: {
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    }
                }
            },
            //delete Doctor route
            {
                method: "DELETE",
                path: "/api/v1/Doctor/{doctorId}",
                handler: Handlers_1.deleteDoctorHandler,
                options: {
                    pre: [Helpers_1.isDoctorOrAdmin],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            doctorId: joi_1.default.string().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    }
                }
            }
        ]);
    }
};
exports.default = doctorPlugin;
//# sourceMappingURL=Doctor.js.map