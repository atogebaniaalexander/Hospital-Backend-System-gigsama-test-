"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateActionableStepInputValidator = exports.createActionableStepInputValidator = exports.updateNotesInputValidator = exports.createNotesInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const notesInputValidator = joi_1.default.object({
    patientId: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    content: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    doctorId: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
});
exports.createNotesInputValidator = notesInputValidator.tailor("create");
exports.updateNotesInputValidator = notesInputValidator.tailor("update");
const ActionableStepInputValidator = joi_1.default.object({
    noteId: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    type: joi_1.default.string().valid('CHECKLIST', 'PLAN').alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(),
        update: (schema) => schema.optional().allow(),
    }),
    scheduledDate: joi_1.default.date().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(),
    }),
    isCompleted: joi_1.default.boolean().alter({
        create: (schema) => schema.optional().allow(),
        update: (schema) => schema.optional().allow(),
    }),
});
exports.createActionableStepInputValidator = ActionableStepInputValidator.tailor("create");
exports.updateActionableStepInputValidator = ActionableStepInputValidator.tailor("update");
//# sourceMappingURL=notesValidators.js.map