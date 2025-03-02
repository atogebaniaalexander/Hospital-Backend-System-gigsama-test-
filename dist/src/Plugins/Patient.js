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
const API_AUTH_STRATEGY = "PATIENT-JWT";
const patientPlugin = {
    name: "patient",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
        if (!process.env.JWT_SECRET) {
            server.log("warn", "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it.");
        }
        server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
            key: JWT_SECRET,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: Helpers_1.patientValidateAPIToken,
        });
        server.route([
            // create a patient route
            {
                method: "POST",
                path: "/api/v1/Patient/create",
                handler: Handlers_1.createPatientHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: Validators_1.createPatientInputValidator,
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            // get all patient route
            {
                method: "GET",
                path: "/api/v1/Patients",
                handler: Handlers_1.listPatientHandler,
                options: {
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    }
                }
            },
            //update patient route
            {
                method: "PUT",
                path: "/api/v1/Patient/{patientId}",
                handler: Handlers_1.updatePatientHandler,
                options: {
                    pre: [Helpers_1.isPatientOrAdmin],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            patientId: joi_1.default.string().required(),
                        }),
                        payload: Validators_1.updatePatientInputValidator,
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    }
                }
            },
            //delete patient route
            {
                method: "DELETE",
                path: "/api/v1/Patient/{patientId}",
                handler: Handlers_1.deletePatientHandler,
                options: {
                    pre: [Helpers_1.isPatientOrAdmin],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            patientId: joi_1.default.string().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    }
                }
            },
            // select a doctor route
            {
                method: "POST",
                path: "/api/v1/Patient/selectDoctor",
                handler: Handlers_1.assignDoctorToPatientHandler,
                options: {
                    pre: [Helpers_1.isUserPatient],
                    auth: {
                        mode: "required",
                        strategy: API_AUTH_STRATEGY
                    },
                    validate: {
                        payload: joi_1.default.object({
                            doctorId: joi_1.default.string().required()
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        }
                    }
                }
            },
        ]);
    }
};
exports.default = patientPlugin;
//# sourceMappingURL=Patient.js.map