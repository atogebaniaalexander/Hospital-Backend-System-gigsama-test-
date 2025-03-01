"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userManagement_1 = require("../src/Handlers/userManagement");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const email = process.env.ADMINEMAIL || " ";
const name = process.env.ADMINNAME || " ";
const password = process.env.ADMINPASSWORD || " ";
async function main() {
    const AdminData = {
        email: email,
        name: name,
        password: password,
    };
    const createSystemAdmin = await (0, userManagement_1.createAdmin)(AdminData);
    console.log(createSystemAdmin);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=createAdmin.js.map