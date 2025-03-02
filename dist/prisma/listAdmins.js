"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdminHandler = listAdminHandler;
const client_1 = require("@prisma/client");
const extras_1 = require("../src/Helpers/extras");
async function listAdminHandler() {
    const prisma = new client_1.PrismaClient();
    try {
        const admins = await (0, extras_1.executePrismaMethod)(prisma, "admin", "findMany", {});
        if (!admins) {
            throw ("Failed to fetch admins");
        }
        console.log(admins);
    }
    catch (err) {
        throw ("Internal Server Error occurred, failed to fetch admins: " + err);
    }
}
async function main() {
    const listAdmin = await listAdminHandler();
    console.log(listAdmin);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=listAdmins.js.map