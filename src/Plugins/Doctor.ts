import Hapi from "@hapi/hapi";
import Joi from "joi";
import {  isDoctorOrAdmin, isUserAdmin, isUserDoctor } from "../Helpers";
import { createDoctorHandler, deleteDoctorHandler, getAvailableDoctorsHandler, getDoctorPatientsHandler, listDoctorsHandler, updateDoctorHandler } from "../Handlers";
import { createDoctorInputValidator, updateDoctorInputValidator } from "../Validators";
import { API_AUTH_STRATEGY } from "./Auth";


const doctorPlugin: Hapi.Plugin<void> = {
    name: "doctor",
    dependencies: ["prisma", "hapi-auth-jwt2"],
    register: async function (server: Hapi.Server) {
      
         server.route([
          // create a doctor route
           {
             method: "POST",
             path: "/api/v1/Doctor/create",
             handler: createDoctorHandler,
             options: {
               auth: false,
               validate: {
                 payload: createDoctorInputValidator,
                 failAction: (request, h, err) => {
                   throw err;
                 },
               },
             },
           },
           // get all doctors route
           {
            method: "GET",
            path: "/api/v1/Doctors",
            handler: listDoctorsHandler,
            options:{
              auth:{
                mode:"required",
                strategy: API_AUTH_STRATEGY
              }
            }
           },
           // update Doctor route
           {
            method: "PUT",
            path: "/api/v1/Doctor/{doctorId}",
            handler: updateDoctorHandler,
            options:{
              pre:[isDoctorOrAdmin],
              auth:{
                mode: "required",
                strategy: API_AUTH_STRATEGY
              },
              validate:{
                params: Joi.object({
                  doctorId: Joi.string().required(),
                }),
                payload: updateDoctorInputValidator,
                failAction: (request, h, err) => {
                  throw err;
                },
              }
            }
           },
           //delete Doctor route
           {
            method: "DELETE",
            path: "/api/v1/Doctor/{doctorId}",
            handler: deleteDoctorHandler,
            options:{
              pre:[isDoctorOrAdmin],
              auth:{
                mode: "required",
                strategy: API_AUTH_STRATEGY
              },
              validate:{
                params: Joi.object({
                  doctorId: Joi.string().required(),
                }),
                failAction: (request, h, err) => {
                  throw err;
                },
              }
            }
           },
           // available doctors routes
           {
              method: "GET",
              path: "/api/v1/Doctor/availableDoctors",
              handler: getAvailableDoctorsHandler,
              options: {
                auth: {
                  mode: "required",
                  strategy: API_AUTH_STRATEGY
                }
              }
            },
            // get patients assigned route
            {
              method: "GET",
              path: "/api/v1/Doctor/patients",
              handler: getDoctorPatientsHandler,
              options: {
                pre: [isUserDoctor],
                auth: {
                  mode: "required",
                  strategy: API_AUTH_STRATEGY
                }
              }
            }
         ]);
    }
};

export default doctorPlugin;