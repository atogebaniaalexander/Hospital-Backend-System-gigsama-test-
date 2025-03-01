import { PrismaClient } from "@prisma/client";
import Hapi from "@hapi/hapi";

// Singleton pattern for Prisma Client
let prisma: PrismaClient | null = null;

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

// plugin to instantiate Prisma Client
const prismaPlugin: Hapi.Plugin<null> = {
  name: "prisma",
  register: async function (server: Hapi.Server) {
    // Check if Prisma Client has been instantiated already
    if (!prisma) {
      prisma = new PrismaClient({
        // Uncomment 👇 for logs
        //log: ['error', 'warn', 'query'],
      });
    }

    server.app.prisma = prisma;

    // Close DB connection after the server's connection listeners are stopped
    // Related issue: https://github.com/hapijs/hapi/issues/2839
    server.ext({
      type: "onPostStop",
      method: async (server: Hapi.Server) => {
        if (prisma) {
          await prisma.$disconnect();
        }
      },
    });
  },
};

export default prismaPlugin;
