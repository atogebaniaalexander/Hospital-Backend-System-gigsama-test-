"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const Helpers_1 = require("../Helpers");
const Handlers_1 = require("../Handlers");
const Validators_1 = require("../Validators");
const Auth_1 = require("./Auth");
const patientPlugin = {
    name: "patient",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
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
                        failAction: (request, err) => {
                            request.log("error", err);
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
                        strategy: Auth_1.API_AUTH_STRATEGY
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
                        strategy: Auth_1.API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            patientId: joi_1.default.string().required(),
                        }),
                        payload: Validators_1.updatePatientInputValidator,
                        failAction: (request, err) => {
                            request.log("error", err);
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
                        strategy: Auth_1.API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            patientId: joi_1.default.string().required(),
                        }),
                        failAction: (request, err) => {
                            request.log("error", err);
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
                        strategy: Auth_1.API_AUTH_STRATEGY
                    },
                    validate: {
                        payload: joi_1.default.object({
                            doctorId: joi_1.default.string().required()
                        }),
                        failAction: (request, err) => {
                            request.log("error", err);
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