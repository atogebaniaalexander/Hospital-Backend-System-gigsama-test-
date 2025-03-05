import nodemailer from "nodemailer";

import Hapi from "@hapi/hapi";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    transporter: any;
  }
}

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || "user",
        pass: process.env.SMTP_PASS || "pass",
    },
});
const emailPlugin: Hapi.Plugin<void> = {
    name: "email",
    register: async function (server: Hapi.Server) {
        
        server.app.transporter = transporter;

       server.route([

       ]);

    },
};

export default emailPlugin;