import Hapi from "@hapi/hapi";
import Joi from "joi";
import dotenv from "dotenv";
import { doctorValidateAPIToken, isDoctorOrAdmin, isUserAdmin, isUserDoctor } from "../Helpers";
import { createDoctorHandler, deleteDoctorHandler, listDoctorsHandler, updateDoctorHandler } from "../Handlers";
import { createDoctorInputValidator, updateDoctorInputValidator } from "../Validators";

declare module "@hapi/hapi" {
  export interface AuthCredentials {
    doctorId: string;
    tokenId: string;
    email: string;
    name: string;
  }
}

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const API_AUTH_STRATEGY = "DOCTOR-JWT";

const doctorPlugin: Hapi.Plugin<void> = {
    name: "doctor",
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
           validate: doctorValidateAPIToken,
         });
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
           }
         ]);
    }
};

export default doctorPlugin;