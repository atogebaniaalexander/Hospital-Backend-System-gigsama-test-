import Joi from "joi";

const adminInputValidator = Joi.object({
  email: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.required(),
  }),
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.required(),
  }),
  password: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
});

export const createAdminInputValidator = adminInputValidator.tailor("create");
export const updateAdminInputValidator = adminInputValidator.tailor("update");

const doctorInputValidator = Joi.object({
  email: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.required(),
  }),
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.required(),
  }),
  password: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
  specialty: Joi.string().alter({
    create: (schema) => schema.optional().allow(),
    update: (schema) => schema.optional().allow(),
  }),
  available: Joi.boolean().alter({
    create: (schema) => schema.optional().allow(),
    update: (schema) => schema.optional().allow(),
  }),
});

export const createDoctorInputValidator = doctorInputValidator.tailor("create");
export const updateDoctorInputValidator = doctorInputValidator.tailor("update");


const patientInputValidator = Joi.object({
  email: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.required(),
  }),
  name: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.required(),
  }),
  password: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(),
  }),
});

export const createPatientInputValidator = patientInputValidator.tailor("create");
export const updatePatientInputValidator = patientInputValidator.tailor("update");
