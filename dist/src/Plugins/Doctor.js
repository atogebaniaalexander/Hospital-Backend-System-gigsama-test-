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
const doctorPlugin = {
    name: "doctor",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server) {
        server.route([
            // create a doctor route
            {
                method: "POST",
                path: "/api/v1/Doctor/create",
                handler: Handlers_1.createDoctorHandler,
                options: {
                    pre: [Helpers_1.isUserAdmin],
                    auth: {
                        mode: "required",
                        strategy: Auth_1.API_AUTH_STRATEGY,
                    },
                    validate: {
                        payload: Validators_1.createDoctorInputValidator,
                        failAction: (request, err) => {
                            request.log("error", err);
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
                        strategy: Auth_1.API_AUTH_STRATEGY
                    }
                }
            },
            // update Doctor route
            {
                method: "PUT",
                path: "/api/v1/Doctor/{doctorId}",
                handler: Handlers_1.updateDoctorHandler,
                options: {
                    pre: [Helpers_1.isDoctorOrAdmin],
                    auth: {
                        mode: "required",
                        strategy: Auth_1.API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            doctorId: joi_1.default.number().required(),
                        }),
                        payload: Validators_1.updateDoctorInputValidator,
                        failAction: (request, h, err) => {
                            request.log("error", err);
                            throw err;
                        },
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
                        strategy: Auth_1.API_AUTH_STRATEGY
                    },
                    validate: {
                        params: joi_1.default.object({
                            doctorId: joi_1.default.number().required(),
                        }),
                        failAction: (request, err) => {
                            request.log("error", err);
                            throw err;
                        },
                    }
                }
            },
            // available doctors routes
            {
                method: "GET",
                path: "/api/v1/Doctor/availableDoctors",
                handler: Handlers_1.getAvailableDoctorsHandler,
                options: {
                    auth: {
                        mode: "required",
                        strategy: Auth_1.API_AUTH_STRATEGY
                    }
                }
            },
            // get patients assigned route
            {
                method: "GET",
                path: "/api/v1/Doctor/patients",
                handler: Handlers_1.getDoctorPatientsHandler,
                options: {
                    pre: [Helpers_1.isUserDoctor],
                    auth: {
                        mode: "required",
                        strategy: Auth_1.API_AUTH_STRATEGY
                    }
                }
            }
        ]);
    }
};
exports.default = doctorPlugin;
//# sourceMappingURL=Doctor.js.map