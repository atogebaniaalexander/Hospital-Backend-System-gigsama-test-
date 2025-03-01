import Hapi from "@hapi/hapi";
import Joi from "joi";
import dotenv from "dotenv";
import { patientValidateAPIToken } from "../Helpers";

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
const API_AUTH_STRATEGY = "API";

const patientPlugin: Hapi.Plugin<void> = {
    name: "doctor",
    dependencies: ["prisma", "hapi-auth-jwt2", "email"],
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
         server.auth.default(API_AUTH_STRATEGY);
         server.route([]);
    }
};

export default patientPlugin;