import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { validateAPIToken } from "../Helpers";
import { getUserId, loginHandler, logoutHandler, resetPasswordHandler } from "../Handlers";
import Joi from "joi";


declare module "@hapi/hapi" {
  export interface AuthCredentials {
    userId: number;
    tokenId: number;
    email: string;
    name: string;
    userType:string;
  }
}

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
export const API_AUTH_STRATEGY = "API-JWT";

const authPlugin: Hapi.Plugin<void> = {
    name: "auth",
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
           validate: validateAPIToken,
         });

         server.route([
          // login route
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
                failAction: (request, err) => {
                  request.log("error", err);
                  throw err;
                },
              },
            },
          },
          // logout route
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
          },
          // get userId route
          {
            method: "GET",
            path: "/api/v1/userId",
            handler: getUserId,
            options:{
              auth:{
                mode:"required",
                strategy: API_AUTH_STRATEGY
              }
            }
          },
          // reset password route
          {
            method: "POST",
            path: "/api/v1/resetPassword",
            handler:resetPasswordHandler,
            options:{
              auth:false,
              validate:{
                payload: Joi.object({
                  email: Joi.string().email().required(),
                  password: Joi.string().required()
                }),
                failAction: (request, err) => {
                  request.log("error", err);
                  throw err;
                },
              }
            }
          }
         ]);
    }
};

export default authPlugin;