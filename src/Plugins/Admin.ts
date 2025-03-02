import Hapi from "@hapi/hapi";
import Joi from "joi";
import dotenv from "dotenv";
import { isUserAdmin } from "../Helpers";
import { logsHandler } from "../Utils";
import { adminAssignDoctorToPatientHandler, loginHandler, logoutHandler } from "../Handlers";
import { API_AUTH_STRATEGY } from "./Auth";



const adminPlugin: Hapi.Plugin<void> = {
    name: "admin",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server: Hapi.Server) {
         server.route([
          //logs
          {
            method: "PUT",
            path: "/api/v1/logs/{startDate}/{endDate}",
            handler: logsHandler,
            options: {
              pre: [isUserAdmin],
              auth: {
                mode: "required",
                strategy: API_AUTH_STRATEGY,
              },
              validate: {
                params: Joi.object({
                  startDate: Joi.string().required(),
                  endDate: Joi.string().required(),
                }),
                failAction: (request, h, err) => {
                  throw err;
                },
              },
            },
          },
          // assign patient to a doctor
          {
            method: "POST",
            path: "/api/v1/Admin/assignDoctorToPatient",
            handler: adminAssignDoctorToPatientHandler,
            options: {
              pre: [isUserAdmin],
              auth: {
                mode: "required",
                strategy: API_AUTH_STRATEGY
              },
              validate: {
                payload: Joi.object({
                  doctorId: Joi.string().required(),
                  patientId: Joi.string().required()
                }),
                failAction: (request, h, err) => {
                  throw err;
                }
              }
            }
          },
          {
            // default status endpoint
            method: "GET",
            path: "/api/v1/",
            handler: (_, h: Hapi.ResponseToolkit) =>
              h.response({ up: true }).code(200),
            options: {
              auth: false,
            },
          },
          {
            method: "POST",
            path: "/api/v1/login",
            handler: loginHandler,
            options: {
              auth: false,
              validate: {
                payload: Joi.object({
                  email: Joi.string().email().required(),
                  password: Joi.string().required(),
                  role: Joi.string().valid("patient", "doctor","admin").required(),
                }),
                failAction: (request, h, err) => {
                  throw err;
                },
              },
            },
          },
          {
            method: "GET",
            path: "/api/v1/logout",
            handler:logoutHandler,
            options:{
              auth:{
                mode:"required",
                strategy: API_AUTH_STRATEGY
              }
            }
          }
         ]);
    }
};

export default adminPlugin;