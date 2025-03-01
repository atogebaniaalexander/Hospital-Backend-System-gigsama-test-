import Hapi from "@hapi/hapi";
import Joi from "joi";


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
      
    ]);
  },
};

export default statusPlugin;
