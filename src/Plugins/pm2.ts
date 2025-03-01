import * as Hapi from "@hapi/hapi";

const pm2plugin: Hapi.Plugin<undefined> = {
  name: "hapi-graceful-pm2",
  version: "1.0.0",
  register: async function (server: Hapi.Server) {
    // Handle process termination signals
    process.on("SIGINT", async () => {
      console.log("Received SIGINT signal. Closing server gracefully...");
      await server.stop({ timeout: 10000 }); // Wait for 10 seconds for existing connections to close

      console.log("Server closed successfully.");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Received SIGTERM signal. Closing server gracefully...");
      await server.stop({ timeout: 10000 }); // Wait for 10 seconds for existing connections to close

      console.log("Server closed successfully.");
      process.exit(0);
    });

    // Log when the server starts
    server.events.on("start", () => {
      console.log(`Server started at: ${server.info.uri}`);
    });

    // Log when the server stops
    server.events.on("stop", () => {
      console.log("Server stopped.");
    });
  },
};

export default pm2plugin;
