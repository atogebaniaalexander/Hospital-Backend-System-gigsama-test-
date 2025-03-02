"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientInputValidator = exports.createPatientInputValidator = exports.updateDoctorInputValidator = exports.createDoctorInputValidator = exports.updateAdminInputValidator = exports.createAdminInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const adminInputValidator = joi_1.default.object({
    email: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.required(),
    }),
    name: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.required(),
    }),
    password: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
});
exports.createAdminInputValidator = adminInputValidator.tailor("create");
exports.updateAdminInputValidator = adminInputValidator.tailor("update");
const doctorInputValidator = joi_1.default.object({
    email: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.required(),
    }),
    name: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    password: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    specialty: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(),
        update: (schema) => schema.optional().allow(),
    }),
    available: joi_1.default.boolean().alter({
        create: (schema) => schema.optional().allow(),
        update: (schema) => schema.optional().allow(),
    }),
});
exports.createDoctorInputValidator = doctorInputValidator.tailor("create");
exports.updateDoctorInputValidator = doctorInputValidator.tailor("update");
const patientInputValidator = joi_1.default.object({
    email: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.required(),
    }),
    name: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    password: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
});
exports.createPatientInputValidator = patientInputValidator.tailor("create");
exports.updatePatientInputValidator = patientInputValidator.tailor("update");
//# sourceMappingURL=usersValidators.js.map