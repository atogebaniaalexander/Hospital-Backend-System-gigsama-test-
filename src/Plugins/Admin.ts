import Hapi from "@hapi/hapi";
import Joi from "joi";
import dotenv from "dotenv";
import { adminValidateAPIToken, isUserAdmin } from "../Helpers";
import { logsHandler } from "../Utils";
import { listAdminHandler } from "../Handlers";

declare module "@hapi/hapi" {
  export interface AuthCredentials {
    adminId: string;
    tokenId: string;
    email: string;
    name: string;
  }
}

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const API_AUTH_STRATEGY = "ADMIN-JWT";

const adminPlugin: Hapi.Plugin<void> = {
    name: "admin",
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
           validate: adminValidateAPIToken,
         });

         server.route([
          // get admins
          {
            method: "GET",
            path: "/api/v1/Admins",
            handler: listAdminHandler,
              options:{
                pre:[isUserAdmin],
                auth:{
                  mode:"required",
                  strategy: API_AUTH_STRATEGY
                }
              }
          },
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
         ]);
    }
};

export default adminPlugin;