import Hapi from "@hapi/hapi";
import Joi from "joi";

import { isPatientOrAdmin, isUserPatient } from "../Helpers";
import { assignDoctorToPatientHandler, createPatientHandler, deletePatientHandler, getPatientHandler, listPatientHandler, updatePatientHandler } from "../Handlers";
import { createPatientInputValidator, updatePatientInputValidator } from "../Validators";
import { API_AUTH_STRATEGY } from "./Auth";


const patientPlugin: Hapi.Plugin<void> = {
    name: "patient",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server: Hapi.Server) {
        

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
                      failAction: (request,err) => {
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
                    patientId: Joi.number().required(),
                  }),
                  payload: updatePatientInputValidator,
                  failAction: (request,err) => {
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
                  handler: deletePatientHandler,
                  options:{
                    pre:[isPatientOrAdmin],
                    auth:{
                      mode: "required",
                      strategy: API_AUTH_STRATEGY
                    },
                    validate:{
                      params: Joi.object({
                        patientId: Joi.number().required(),
                      }),
                      failAction: (request,err) => {
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
              handler: assignDoctorToPatientHandler,
              options: {
                pre: [isUserPatient],
                auth: {
                  mode: "required",
                  strategy: API_AUTH_STRATEGY
                },
                validate: {
                  payload: Joi.object({
                    doctorId: Joi.number().required()
                  }),
                  failAction: (request,err) => {
                    request.log("error", err);
                    throw err;
                  }
                }
              }
            },
            // get a patient by id route
            {
              method: "GET",
              path: "/api/v1/Patient/{patientId}",
              handler: getPatientHandler,
              options: {
                auth: {
                  mode: "required",
                  strategy: API_AUTH_STRATEGY
                },
                validate: {
                  params: Joi.object({
                    patientId: Joi.number().required()
                  }),
                  failAction: (request, err) => {
                    request.log("error", err);
                    throw err;
                  }
                }
              }
            }
         ]);
    }
};

export default patientPlugin;