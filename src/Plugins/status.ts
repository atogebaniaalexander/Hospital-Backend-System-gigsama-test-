import Hapi from "@hapi/hapi";
import Joi from "joi";
import { loginHandler, logoutHandler } from "../Handlers";
import { log } from "console";


const API_AUTH_STRATEGY = "API";

const statusPlugin: Hapi.Plugin<undefined> = {
  name: "app/status",
  register: async function (server: Hapi.Server) {
    server.route([
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
  },
};

export default statusPlugin;
