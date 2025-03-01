"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Singleton pattern for Prisma Client
let prisma = null;
// plugin to instantiate Prisma Client
const prismaPlugin = {
    name: "prisma",
    register: async function (server) {
        // Check if Prisma Client has been instantiated already
        if (!prisma) {
            prisma = new client_1.PrismaClient({
            // Uncomment 👇 for logs
            //log: ['error', 'warn', 'query'],
            });
        }
        server.app.prisma = prisma;
        // Close DB connection after the server's connection listeners are stopped
        // Related issue: https://github.com/hapijs/hapi/issues/2839
        server.ext({
            type: "onPostStop",
            method: async (server) => {
                if (prisma) {
                    await prisma.$disconnect();
                }
            },
        });
    },
};
exports.default = prismaPlugin;
//# sourceMappingURL=prisma.js.map