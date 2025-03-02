import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import { validateAPIToken } from "../Helpers";


declare module "@hapi/hapi" {
  export interface AuthCredentials {
    userId: string;
    tokenId: string;
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
    }
};

export default authPlugin;