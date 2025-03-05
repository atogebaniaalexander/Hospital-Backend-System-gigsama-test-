"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const extras_1 = require("../src/Helpers/extras");
const types_1 = require("../src/Helpers/types");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const date_fns_1 = require("date-fns");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailManagement_1 = require("../src/Handlers/emailManagement");
dotenv_1.default.config();
const email = process.env.ADMINEMAIL || " ";
const name = process.env.ADMINNAME || " ";
const password = process.env.ADMINPASSWORD || " ";
const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
function generateAuthToken(name, email, tokenType, userId) {
    const jwtPayload = { name, email, tokenType, userId };
    return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        noTimestamp: true,
    });
}
async function createAdmin(userData) {
    const prisma = new client_1.PrismaClient();
    const { email, name, password } = userData;
    try {
        // check if admin exists
        const checkIfUserExist = await (0, extras_1.executePrismaMethod)(prisma, "admin", "findUnique", {
            where: {
                email: email,
            }
        });
        if (checkIfUserExist) {
            throw Error("Admin Account already exists!");
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const Admin = await (0, extras_1.executePrismaMethod)(prisma, "admin", "create", {
            data: {
                email: email,
                name: name,
                password: hashPassword,
                createdAt: (0, extras_1.getCurrentDate)(),
                updatedAt: (0, extras_1.getCurrentDate)()
            }
        });
        if (!Admin) {
            throw Error("Failed to create Admin");
        }
        const token = generateAuthToken(name, email, types_1.TokenType.ADMIN, Admin.id);
        const expiration = (0, date_fns_1.add)(new Date(), { minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES, });
        const AdminToken = await (0, extras_1.executePrismaMethod)(prisma, "token", "create", {
            data: {
                type: types_1.TokenType.ADMIN,
                valid: true,
                expiration: expiration,
                Token: token,
                createdAt: (0, extras_1.getCurrentDate)(),
                updatedAt: (0, extras_1.getCurrentDate)(),
                adminId: Admin.id,
            }
        });
        if (!AdminToken) {
            throw Error("Failed to create Admin Token");
        }
        const emailSent = await (0, emailManagement_1.adminAccountCreationEmail)(email, name, password);
        if (emailSent !== "Email sent") {
            await (0, extras_1.executePrismaMethod)(prisma, "token", "delete", { where: { id: AdminToken.id } });
            await (0, extras_1.executePrismaMethod)(prisma, "admin", "delete", { where: { id: Admin.id } });
            throw Error("Failed to send email");
        }
        return " Admin created Successfully!";
    }
    catch (err) {
        throw Error("Internal server Error: " + err.toString());
    }
}
async function main() {
    const AdminData = {
        email: email,
        name: name,
        password: password,
    };
    const createSystemAdmin = await createAdmin(AdminData);
    console.log(createSystemAdmin);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=createAdmin.js.map