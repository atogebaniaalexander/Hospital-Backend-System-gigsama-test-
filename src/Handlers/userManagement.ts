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


