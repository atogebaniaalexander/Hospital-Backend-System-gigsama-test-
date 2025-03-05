import Joi from "joi";


const notesInputValidator = Joi.object({
  patientId: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
  content: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
  doctorId: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
});

export const createNotesInputValidator = notesInputValidator.tailor("create");
export const updateNotesInputValidator = notesInputValidator.tailor("update");

const ActionableStepInputValidator = Joi.object({
  noteId: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
  type: Joi.string().valid('CHECKLIST','PLAN').alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.optional().allow(),
    update: (schema) => schema.optional().allow(),
  }),
  scheduledDate: Joi.date().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
   isCompleted: Joi.boolean().alter({
    create: (schema) => schema.optional().allow(),
    update: (schema) => schema.optional().allow(),
  }),

});

export const createActionableStepInputValidator = ActionableStepInputValidator.tailor("create");
export const updateActionableStepInputValidator = ActionableStepInputValidator.tailor("update");
