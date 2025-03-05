import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { executePrismaMethod, getCurrentDate } from "../src/Helpers/extras";
import bcrypt from "bcryptjs";



dotenv.config();

const email = process.env.ADMINEMAIL || " ";
const password = process.env.NEWADMINPASSWORD || " ";





async function changeAdminPasswordHandler(email: string, password: string) {
    const prisma = new PrismaClient();
    try {
        const checkIfUserExist = await executePrismaMethod(prisma, "admin", "findUnique", {
            where: {
                email: email,
            },
        });
        if (!checkIfUserExist) {
            throw Error("Admin Account does not exist!");
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const updatedAdmin = await executePrismaMethod(prisma, "admin", "update", {
            where: {
                email: email,
            },
            data: {
                password: hashPassword,
                updatedAt: getCurrentDate(),
            },
        });
        if (!updatedAdmin) {
            throw Error("Failed to update Admin password");
        }
        return "Password updated successfully!";
    } catch (err: any) {
        throw Error("Internal server Error: " + err.toString());
    }
}
async function main() {

    const AdminData = {
      email: email,
      password: password,
    } 
    const changeAdminPassword = await changeAdminPasswordHandler(AdminData.email, AdminData.password);
    console.log(changeAdminPassword);
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
