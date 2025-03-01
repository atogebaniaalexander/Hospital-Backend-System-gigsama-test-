import Hapi from "@hapi/hapi";
import Joi from "joi";
import { isUserAdmin } from "../Helpers";
import { logsHandler } from "../Utils";

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
  },
};

export default statusPlugin;
