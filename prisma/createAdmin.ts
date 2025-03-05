import { PrismaClient } from "@prisma/client";
import { AdminModel } from "../src/Models";
import dotenv from "dotenv";
import { executePrismaMethod, getCurrentDate } from "../src/Helpers/extras";
import {TokenType} from "../src/Helpers/types";
import bcrypt from "bcryptjs";
import { add } from "date-fns";
import jwt from "jsonwebtoken";
import {adminAccountCreationEmail} from "../src/Handlers/emailManagement";

dotenv.config();

const email = process.env.ADMINEMAIL || " ";
const name = process.env.ADMINNAME || " ";
const password = process.env.ADMINPASSWORD || " ";
const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";

function generateAuthToken (
    name: string,
    email: string,
    tokenType: TokenType,
    userId: string
){
    const jwtPayload = { name, email, tokenType, userId };
    return jwt.sign(jwtPayload,JWT_SECRET,{
        algorithm:JWT_ALGORITHM,
        noTimestamp: true,
    });
}

async function createAdmin(userData: AdminModel) {
    const prisma = new PrismaClient();
    const {email,name,password} = userData;

    try{
        // check if admin exists

        const checkIfUserExist = await executePrismaMethod(
          prisma,
          "admin",
          "findUnique",
          {
            where: {
                email: email,
            }
        });

        if(checkIfUserExist){
            throw Error("Admin Account already exists!");
        }
       
        const hashPassword = await bcrypt.hash(password, 10);
        
        const Admin = await executePrismaMethod(prisma,"admin","create",{
            data:{
                email: email,
                name: name,
                password: hashPassword,
                createdAt: getCurrentDate(),
                updatedAt: getCurrentDate()
            }
        });

        if(!Admin){
           throw Error("Failed to create Admin");
        }


        const token = generateAuthToken(name,email,TokenType.ADMIN,Admin.id);
        
        const expiration = add(new Date(), {minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,})
        
        const AdminToken = await executePrismaMethod(
          prisma,
          "token",
          "create",
          {
            data: {  // Add this data wrapper
              type: TokenType.ADMIN,
              valid: true,
              expiration: expiration,
              Token: token,
              createdAt: getCurrentDate(),
              updatedAt: getCurrentDate(),
              adminId: Admin.id,
            }
          }
        );

        if(!AdminToken){
            throw Error("Failed to create Admin Token");
        }

        const emailSent = await adminAccountCreationEmail(email,name,password);
        if(emailSent !== "Email sent"){
            await executePrismaMethod(prisma,"token","delete",{where:{id: AdminToken.id}});
            await executePrismaMethod(prisma,"admin","delete",{where:{id: Admin.id}});
            throw Error("Failed to send email");
        }
        return " Admin created Successfully!";

    }catch(err: any){
        throw Error("Internal server Error: "+ err.toString());
    }
}
async function main() {

    const AdminData = {
      email: email,
      name: name,
      password: password,
    } as AdminModel;

    const createSystemAdmin = await createAdmin(AdminData);

    console.log(createSystemAdmin);
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
