import nodemailer from "nodemailer";

import Hapi from "@hapi/hapi";
import Joi from "joi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    transporter: any;
  }
}


const emailPlugin: Hapi.Plugin<void> = {
    name: "email",
    register: async function (server: Hapi.Server) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "localhost",
            port: process.env.SMTP_PORT || "587",
            secure: true,
            auth: {
                user: process.env.SMTP_USER || "user",
                pass: process.env.SMTP_PASS || "pass",
            },
        });

        server.app.transporter = transporter;

       server.route([
        
       ]);

    },
};

export default emailPlugin;