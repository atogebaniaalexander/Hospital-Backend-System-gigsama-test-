import { createAdmin } from "../src/Handlers/userManagement";
import { AdminModel } from "../src/Models";
import dotenv from "dotenv";



dotenv.config();

const email = process.env.ADMINEMAIL || " ";
const name = process.env.ADMINNAME || " ";
const password = process.env.ADMINPASSWORD || " ";

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
