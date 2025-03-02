import dotenv from "dotenv";
import Hapi from "@hapi/hapi";
import { Logger} from "./Utils";
import { RequestType } from "./Helpers";
import hapiAuthJwt2 from "hapi-auth-jwt2";
import prismaPlugin  from "./Plugins/prisma";
import pm2plugin from "./Plugins/pm2";
import adminPlugin from "./Plugins/Admin";
import doctorPlugin from "./Plugins/Doctor";
import patientPlugin from "./Plugins/Patient";
import authPlugin from "./Plugins/Auth";



declare module "@hapi/hapi" {
  interface ServerApplicationState {
    logger: Logger;
  }
}

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const server: Hapi.Server = Hapi.server({
  port: process.env.PORT || 8001,
  host: process.env.HOST || "localhost",
  routes: {}
});

export default server;

export async function createServer(): Promise<Hapi.Server> {
  if (!isProduction) {
    console.log("Running in development mode...");
  } else {
    console.log("Running in production mode...");
  }
  // Instantiate the Logger
  const logger = new Logger();

  // Inject the logger into the server's application state
  server.app.logger = logger;
  
  const plugins: Array<Hapi.ServerRegisterPluginObject<any>> = [
    { plugin: pm2plugin },
    { plugin: hapiAuthJwt2 },
    { plugin: authPlugin },
    { plugin: prismaPlugin },
    { plugin: adminPlugin },
    { plugin: doctorPlugin },
    { plugin: patientPlugin },

  ];

  await server.register(plugins);

  await server.initialize();
  server.app.logger.info("Server initialized.",RequestType.CREATE,"System Up");

  return server;
}

export async function startServer(server: Hapi.Server): Promise<Hapi.Server> {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});