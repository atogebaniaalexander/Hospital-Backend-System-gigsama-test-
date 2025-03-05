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
                  doctorId: Joi.number().required(),
                  patientId: Joi.number().required()
                }),
                failAction: (request, h, err) => {
                  throw err;
                }
              }
            }
          },
          // default status endpoint
          {
            
            method: "GET",
            path: "/api/v1/",
            handler: (_, h: Hapi.ResponseToolkit) =>
              h.response({ up: true }).code(200),
            options: {
              auth: false,
            },
          },
         ]);
    }
};

export default adminPlugin;