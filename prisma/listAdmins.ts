import { PrismaClient } from "@prisma/client";
import { executePrismaMethod } from "../src/Helpers/extras";



export async function listAdminHandler(){
  const prisma = new PrismaClient();


  try{
    const admins = await executePrismaMethod(prisma,"admin","findMany",{});
     if(!admins){
      throw("Failed to fetch admins");
    }

    console.log(admins);  

  }catch(err){
    throw("Internal Server Error occurred, failed to fetch admins: "+err);
  }
}
async function main() {
  const listAdmin = await listAdminHandler();
  console.log(listAdmin);
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
