import Hapi from "@hapi/hapi";
import Joi from "joi";
import dotenv from "dotenv";
import { isPatientOrAdmin, isUserPatient, patientValidateAPIToken } from "../Helpers";
import { createPatientHandler, deletePatientHandler, listPatientHandler, updatePatientHandler } from "../Handlers";
import { createPatientInputValidator, updatePatientInputValidator } from "../Validators";

declare module "@hapi/hapi" {
  export interface AuthCredentials {
    patientId: string;
    tokenId: string;
    email: string;
    name: string;
  }
}

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const API_AUTH_STRATEGY = "PATIENT-JWT";

const patientPlugin: Hapi.Plugin<void> = {
    name: "patient",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server: Hapi.Server) {
         if (!process.env.JWT_SECRET) {
           server.log(
             "warn",
             "The JWT_SECRET env var is not set. This is unsafe! If running in production, set it."
           );
         }
         server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
           key: JWT_SECRET,
           verifyOptions: { algorithms: [JWT_ALGORITHM] },
           validate: patientValidateAPIToken,
         });

         server.route([
           // create a patient route
            {
              method: "POST",
              path: "/api/v1/Patient/create",
              handler: createPatientHandler,
              options: {
                  auth: false,
                  validate: {
                    payload: createPatientInputValidator,
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
                    handler: listPatientHandler,
                    options:{
                      auth:{
                        mode:"required",
                        strategy: API_AUTH_STRATEGY
                      }
                    }
            },    
            //update patient route
            {
              method: "PUT",
              path: "/api/v1/Patient/{patientId}",
              handler: updatePatientHandler,
              options:{
                pre:[isPatientOrAdmin],
                auth:{
                  mode: "required",
                  strategy: API_AUTH_STRATEGY
                },
                validate:{
                  params: Joi.object({
                    patientId: Joi.string().required(),
                  }),
                  payload: updatePatientInputValidator,
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
                  handler: deletePatientHandler,
                  options:{
                    pre:[isPatientOrAdmin],
                    auth:{
                      mode: "required",
                      strategy: API_AUTH_STRATEGY
                    },
                    validate:{
                      params: Joi.object({
                        patientId: Joi.string().required(),
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

export default patientPlugin;