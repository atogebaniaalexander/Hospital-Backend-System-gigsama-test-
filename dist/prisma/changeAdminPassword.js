"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const extras_1 = require("../src/Helpers/extras");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const email = process.env.ADMINEMAIL || " ";
const password = process.env.NEWADMINPASSWORD || " ";
async function changeAdminPasswordHandler(email, password) {
    const prisma = new client_1.PrismaClient();
    try {
        const checkIfUserExist = await (0, extras_1.executePrismaMethod)(prisma, "admin", "findUnique", {
            where: {
                email: email,
            },
        });
        if (!checkIfUserExist) {
            throw Error("Admin Account does not exist!");
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const updatedAdmin = await (0, extras_1.executePrismaMethod)(prisma, "admin", "update", {
            where: {
                email: email,
            },
            data: {
                password: hashPassword,
                updatedAt: (0, extras_1.getCurrentDate)(),
            },
        });
        if (!updatedAdmin) {
            throw Error("Failed to update Admin password");
        }
        return "Password updated successfully!";
    }
    catch (err) {
        throw Error("Internal server Error: " + err.toString());
    }
}
async function main() {
    const AdminData = {
        email: email,
        password: password,
    };
    const changeAdminPassword = await changeAdminPasswordHandler(AdminData.email, AdminData.password);
    console.log(changeAdminPassword);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=changeAdminPassword.js.map