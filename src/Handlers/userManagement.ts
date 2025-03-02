import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";


import { APITokenPayload, AdminModel, DoctorModel, PatientModel } from "../Models";
import { executePrismaMethod, getCurrentDate, RequestType, TokenType} from "../Helpers"

import { add } from "date-fns";


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
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

function decodeAuthToken(token: string){
     try {
       const verifyToken = jwt.verify(token, JWT_SECRET);
       if (verifyToken) {
         return jwt.decode(token);
       }
     } catch (error) {
       console.error("Error decoding token:", error);
       return null; // Return null or throw an error, depending on your use case
     }
}




/** DOCTOR Handlers */
// create a doctor
export async function createDoctorHandler(request:Hapi.Request,h: Hapi.ResponseToolkit){
    const { prisma, logger} = request.server.app;
    const { email, name, password, specialty } = request.payload as DoctorModel;
    const credentials  = request.auth.credentials;

    try{
         const checkIfUserExist = await executePrismaMethod(
           prisma,
           "doctor",
           "findUnique",
           {
             where: {
               email: email,
               name: name,
               specialty: specialty
             },
           }
         );
         
         if(checkIfUserExist){
            logger.error(
              "Doctor Account already exists!",
              RequestType.READ,
              credentials.name
            );
            return h.response({message: " Doctor Account already exist!"}).code(400);
         }

        const hashPassword = await bcrypt.hash(password, 10);

        const Doctor = await executePrismaMethod(prisma, "doctor", "create", {
          data: {
            email: email,
            name: name,
            password: hashPassword,
            specialty: specialty,
            createdAt: getCurrentDate(),
            updatedAt: getCurrentDate(),
          },
        });

        if(!Doctor){
          logger.error(
            "Failed to create Doctor",
            RequestType.CREATE,
            credentials.name,
            Doctor.toString()
          );   
        }

        const token = generateAuthToken(
           name,
           email,
           TokenType.DOCTOR,
           Doctor.id
        );

        const expiration = add(new Date(), {
           minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
        });

        const DoctorToken = await executePrismaMethod(
           prisma,
           "token",
           "create",
           {
             data:{
                type: TokenType.DOCTOR,
                valid: true,
                expiration: expiration,
                Token: token,
                createdAt: getCurrentDate(),
                updatedAt: getCurrentDate(),
                doctorId: Doctor.id,
             }
           }
         );
        if (!DoctorToken) {
           logger.error(
             "Failed to create Doctor Token",
             RequestType.CREATE,
             credentials.name,
             DoctorToken.toString()
           );
           return h.response({ message: "Failed to create Doctor Token" }).code(404);
        }

        logger.info("Doctor " + name + " was Successfully created!",RequestType.CREATE,credentials.name);
        return h.response({message: "Doctor " + name + " was Successfully created!",}).code(201);

    }
    catch(err:any){
        logger.error("Internal Server Error occurred, failed to create Doctor " + name + "'s Account",RequestType.CREATE,credentials.name,err.toString());
        return h
          .response({
            message:
              "Internal Server Error occurred, failed to create Doctor " +
              name +
              "'s Account",
          })
          .code(500);
    }
}
// list all doctors
export async function listDoctorsHandler(request:Hapi.Request, h:Hapi.ResponseToolkit){
  const {prisma, logger} = request.server.app;
  const {name} = request.auth.credentials;

  try{
    const doctors = await executePrismaMethod(prisma,"doctor","findMany",{});

    if(!doctors){
      logger.error("Failed to fetch Doctors",RequestType.READ,name);
      return h.response({message: "Failed to fetch Doctors"}).code(404);
    }

    logger.info("Doctors fetched Successfully",RequestType.READ,name);
    return h.response(doctors).code(200);

  }catch(err:any){
    logger.error("Internal Server Error occurred, failed to fetch Doctors",RequestType.READ,name,err.toString());
    return h.response({message: "Internal Server Error occurred, failed to fetch Doctors"}).code(500);
  }

}
// update a doctor
export async function updateDoctorHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { doctorId } = request.params;
  const { name, email, specialty } = request.payload as DoctorModel;
  const credentials = request.auth.credentials;

  try{
    const checkIfUserExist = await executePrismaMethod(prisma,"doctor","findFirst",{
      where:{
        id: doctorId,
        email: email,
      }
    });
    if(!checkIfUserExist){
      logger.error("Doctor not found",RequestType.READ,name);
      return h.response({message: "Doctor not found"}).code(404);
    }
    const Doctor = await executePrismaMethod(prisma,"doctor","update",{
      where:{
        id: checkIfUserExist.id,
      },
      data:{
        name: name,
        specialty: specialty,
        updatedAt: getCurrentDate(),
      }
    });

    if(!Doctor){
      logger.error("Failed to update Doctor",RequestType.UPDATE,credentials.name);
      return h.response({message: "Failed to update Doctor"}).code(404);
    }

    logger.info("Doctor updated Successfully",RequestType.UPDATE,credentials.name);
    return h.response({message: "Doctor updated Successfully"}).code(201);

  }catch(err:any){
      logger.error("Internal Server Error occurred, failed to update Doctor",RequestType.UPDATE,credentials.name,err.toString());
      return h.response({message: "Internal Server Error occurred, failed to update Doctor"}).code(500);
  }
}
// delete a doctor
export async function deleteDoctorHandler(request: Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { doctorId } = request.params;
  const { name } = request.auth.credentials;

  try{
    const Doctor = await executePrismaMethod(prisma,"doctor","delete",{
      where:{
        id: doctorId
      }
    });

    if(!Doctor){
      logger.error("Failed to delete Doctor",RequestType.DELETE,name);
      return h.response({message: "Failed to delete Doctor"}).code(404);
    }

    logger.info("Doctor deleted Successfully",RequestType.DELETE,name);
    return h.response({message: "Doctor deleted Successfully"}).code(200);

  }catch(err:any){
      logger.error("Internal Server Error occurred, failed to delete Doctor",RequestType.DELETE,name,err.toString());
      return h.response({message: "Internal Server Error occurred, failed to delete Doctor"}).code(500);
  }
}

/** PATIENT Handlers */
// create a patient
export async function createPatientHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma, logger } = request.server.app;
  const { email, name, password } = request.payload as PatientModel;
  const credentials = request.auth.credentials;

  try {
    const checkIfUserExist = await executePrismaMethod(
      prisma,
      "patient",
      "findUnique",
      {
        where: {
          email: email,
          name: name,
        },
      }
    );

    if (checkIfUserExist) {
      logger.error(
        "Patient Account already exists!",
        RequestType.READ,
        credentials.name
      );
      return h
        .response({ message: " Patient Account already exist!" })
        .code(400);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const Patient = await executePrismaMethod(prisma, "patient", "create", {
      data: {
        email: email,
        name: name,
        password: hashPassword,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      },
    });

    if (!Patient) {
      logger.error(
        "Failed to create Patient",
        RequestType.CREATE,
        credentials.name,
        Patient.toString()
      );
    }

    const token = generateAuthToken(name, email, TokenType.PATIENT, Patient.id);

    const expiration = add(new Date(), {
      minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
    });

    const PatientToken = await executePrismaMethod(prisma, "token", "create", {
      data:{
        type: TokenType.PATIENT,
        valid: true,
        expiration: expiration,
        Token: token,
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
        patientId: Patient.id,
      }
    });
    if (!PatientToken) {
      logger.error(
        "Failed to create Patient Token",
        RequestType.CREATE,
        credentials.name,
        PatientToken.toString()
      );
      return h.response({ message: "Failed to create Patient Token" }).code(404);
    }

    logger.info( 
      name + " was Successfully created!",
      RequestType.CREATE,
      credentials.name
    );
    return h
      .response({ message:name + " was Successfully created!" })
      .code(201);
  } catch (err: any) {
    logger.error(
      "Internal Server Error occurred, failed to create" + name +
        "'s Account",
      RequestType.CREATE,
      credentials.name,
      err.toString()
    );
    return h
      .response({
        message:
          "Internal Server Error occurred, failed to create " +
          name +
          "'s Account",
      })
      .code(500);
  }
}
// list all patients
export async function listPatientHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
  const {prisma, logger} = request.server.app;
  const {name} = request.auth.credentials;

  try{
    const patients = await executePrismaMethod(prisma,"patient","findMany",{});

    if(!patients){
      logger.error("Failed to fetch Patients",RequestType.READ,name);
      return h.response({message: "Failed to fetch Patients"}).code(404);
    }

    logger.info("Patients fetched Successfully",RequestType.READ,name);
    return h.response(patients).code(200);

  }catch(err:any){
    logger.error("Internal Server Error occurred, failed to fetch Patients",RequestType.READ,name,err.toString());
    return h.response({message: "Internal Server Error occurred, failed to fetch Patients"}).code(500);
  }
}
// update a patient
export async function updatePatientHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { patientId } = request.params;
  const { name, email } = request.payload as PatientModel;
  const credentials = request.auth.credentials;

  try{
    const checkIfUserExist = await executePrismaMethod(prisma,"patient","findFirst",{
      where:{
        id: patientId,
        email: email,
      }
    });
    if(!checkIfUserExist){
      logger.error("Patient not found",RequestType.READ,name);
      return h.response({message: "Patient not found"}).code(404);
    }
    const Patient = await executePrismaMethod(prisma,"patient","update",{
      where:{
        id: checkIfUserExist.id,
      },
      data:{
        name: name,
        updatedAt: getCurrentDate(),
      }
    });

    if(!Patient){
      logger.error("Failed to update Patient",RequestType.UPDATE,credentials.name);
      return h.response({message: "Failed to update Patient"}).code(404);
    }

    logger.info("Patient updated Successfully",RequestType.UPDATE,credentials.name);
    return h.response({message: "Patient updated Successfully"}).code(201);

  }catch(err:any){
      logger.error("Internal Server Error occurred, failed to update Patient",RequestType.UPDATE,credentials.name,err.toString());
      return h.response({message: "Internal Server Error occurred, failed to update Patient"}).code(500);
  }
}
// update a patient
export async function deletePatientHandler(request: Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { patientId } = request.params;
  const { name } = request.auth.credentials;

  try{
    const Patient = await executePrismaMethod(prisma,"patient","delete",{
      where:{
        id: patientId
      }
    });

    if(!Patient){
      logger.error("Failed to delete Patient",RequestType.DELETE,name);
      return h.response({message: "Failed to delete Patient"}).code(404);
    }

    logger.info("Patient deleted Successfully",RequestType.DELETE,name);
    return h.response({message: "Patient deleted Successfully"}).code(200);

  }catch(err:any){
      logger.error("Internal Server Error occurred, failed to delete Patient",RequestType.DELETE,name,err.toString());
      return h.response({message: "Internal Server Error occurred, failed to delete Patient"}).code(500);
  }
}

/** General  */

//login payload
enum Role {
  DOCTOR = "doctor",
  PATIENT = "patient",
  ADMIN = "admin",
}
interface LoginPayload {
  email: string;
  password: string;
  role: Role;
}

export async function loginHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, logger } = request.server.app;
  const { email, password, role } = request.payload as LoginPayload;

  try {
    let user;
    if (role === Role.DOCTOR) {
      user = await executePrismaMethod(prisma, "doctor", "findUnique", {
        where: {
          email: email,
        },
      });
    } else if (role === Role.PATIENT) {
      user = await executePrismaMethod(prisma, "patient", "findUnique", {
        where: {
          email: email,
        },
      });
    } else if (role === Role.ADMIN) {
      user = await executePrismaMethod(prisma, "admin", "findUnique", {
        where: {
          email: email,
        },
      });
    }else {
      logger.error("Invalid Role", RequestType.READ,email);
      return h.response({ message: "Invalid Role" }).code(400);
    }

    if (!user) {
      logger.error("User not found", RequestType.READ, email);
      return h.response({ message: "User not found" }).code(404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.error("Invalid Password", RequestType.READ, email);
      return h.response({ message: "Invalid Password" }).code(401);
    }

    const token = generateAuthToken(user.name, email, user.token.type, user.id);

    const expiration = add(new Date(), {
      minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
    });

    const Token = await executePrismaMethod(prisma, "token", "update", {
      where:{
        type: role,
        token: user.token.token,
      },
      data: {
        valid: true,
        expiration: expiration,
        Token: token,
        updatedAt: getCurrentDate(),
        doctorId: role === Role.DOCTOR ? user.id : null,
        patientId: role === Role.PATIENT ? user.id : null,
        adminId: role === Role.ADMIN ? user.id : null,
      },
    });
    if (!Token) {
      logger.error(
        "Failed to create Token",
        RequestType.CREATE,
        email,
        Token.toString()
      );
      return h.response({ message: "Failed to create Token" }).code(404);
    }

    logger.info("User logged in successfully", RequestType.READ, email);
    return h.response({ token }).header('Authorization', `Bearer ${token}`).code(200);
  } catch (err: any){
    logger.error("Internal Server Error occurred, failed to login", RequestType.READ, email, err.toString());
    return h.response({ message: "Internal Server Error occurred, failed to login" }).code(500);
  }
}

export async function logoutHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, logger } = request.server.app;
  const { tokenId,name } = request.auth.credentials;

  try {
    const checkIfTokenExist = await executePrismaMethod(prisma, "token", "findUnique", {
      where: {
        id: tokenId,
      },
    });

    if (!checkIfTokenExist) {
      logger.error("Token not found", RequestType.READ, name);
      return h.response({ message: "Token not found" }).code(404);
    }

    const Token = await executePrismaMethod(prisma, "token", "update", {
      where: {
        id: tokenId,
      },
      data: {
        valid: false,
        updatedAt: getCurrentDate(),
      },
    });

    if (!Token) {
      logger.error("Failed to logout", RequestType.UPDATE, name);
      return h.response({ message: "Failed to logout" }).code(404);
    }

    logger.info("User logged out successfully", RequestType.UPDATE, name);
    return h.response({ message: "User logged out successfully" }).code(200);
  } catch (err: any) {
    logger.error("Internal Server Error occurred, failed to logout", RequestType.UPDATE, name, err.toString());
    return h.response({ message: "Internal Server Error occurred, failed to logout" }).code(500);
  }
}