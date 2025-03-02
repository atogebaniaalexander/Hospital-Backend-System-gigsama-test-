"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
exports.startServer = startServer;
const dotenv_1 = __importDefault(require("dotenv"));
const hapi_1 = __importDefault(require("@hapi/hapi"));
const Utils_1 = require("./Utils");
const Helpers_1 = require("./Helpers");
const hapi_auth_jwt2_1 = __importDefault(require("hapi-auth-jwt2"));
const prisma_1 = __importDefault(require("./Plugins/prisma"));
const pm2_1 = __importDefault(require("./Plugins/pm2"));
const Admin_1 = __importDefault(require("./Plugins/Admin"));
const Doctor_1 = __importDefault(require("./Plugins/Doctor"));
const Patient_1 = __importDefault(require("./Plugins/Patient"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
const server = hapi_1.default.server({
    port: process.env.PORT || 8001,
    host: process.env.HOST || "localhost",
    routes: {}
});
exports.default = server;
async function createServer() {
    if (!isProduction) {
        console.log("Running in development mode...");
    }
    else {
        console.log("Running in production mode...");
    }
    // Instantiate the Logger
    const logger = new Utils_1.Logger();
    // Inject the logger into the server's application state
    server.app.logger = logger;
    const plugins = [
        { plugin: pm2_1.default },
        { plugin: hapi_auth_jwt2_1.default },
        { plugin: prisma_1.default },
        { plugin: Admin_1.default },
        { plugin: Doctor_1.default },
        { plugin: Patient_1.default },
    ];
    await server.register(plugins);
    await server.initialize();
    server.app.logger.info("Server initialized.", Helpers_1.RequestType.CREATE, "System Up");
    return server;
}
async function startServer(server) {
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
    return server;
}
process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map