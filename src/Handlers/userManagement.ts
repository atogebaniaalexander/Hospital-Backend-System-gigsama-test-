import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";



import { DoctorModel, PatientModel } from "../Models";
import { executePrismaMethod, getCurrentDate, RequestType, TokenType} from "../Helpers"

import { add } from "date-fns";
import { doctorAccountCreationEmail, passwordResetEmail, patientAccountCreationEmail } from "./emailManagement";


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
function generateAuthToken (
    name: string,
    email: string,
    tokenType: TokenType,
    userId: number,
    userType: string,
){
    const jwtPayload = { name, email, tokenType, userId, userType };
    return jwt.sign(jwtPayload,JWT_SECRET,{
        algorithm:JWT_ALGORITHM,
        noTimestamp: true,
    });
}

export function decodeAuthToken(token: string){
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

//get user id
export function getUserId(request: Hapi.Request,h: Hapi.ResponseToolkit){
    const { userId,userType } = request.auth.credentials;
    return h.response({id:userId,userType:userType}).code(200);
}

// reset password
export async function resetPasswordHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
    const { prisma,logger} = request.server.app;
    const { email, password } = request.payload as {email: string, password: string};
    let isDoctor = false;
    let isPatient = false;
    let name = "User";
    try{
      const findDoctor = await executePrismaMethod(prisma,"doctor","findUnique",{where:{email: email}});
      if(!findDoctor){
        logger.error("User is not a Doctor",RequestType.READ,email);
      }else{
        isDoctor = true;
      }
      const findPatient = await executePrismaMethod(prisma,"patient","findUnique",{where:{email: email}});
      if(!findPatient){
        logger.error("User is not a Patient",RequestType.READ,email);
      }else{
        isPatient = true;
      }

      if(isDoctor === true){
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await executePrismaMethod(prisma,"doctor","update",{
          where:{
            email: email
          },
          data:{
            password: hashPassword,
            updatedAt: getCurrentDate()
          }
        });

        if(!user){
          logger.error("Failed to reset password",RequestType.UPDATE,user.name);
          return h.response({message: "Failed to reset password"}).code(404);
        }
        name = user.name;
        const sendMail = await passwordResetEmail(email,name);
        if(sendMail !== "Email sent"){
          logger.error("Failed to send Password Reset Email",RequestType.UPDATE,user.name);
          await executePrismaMethod(prisma,"doctor","update",{where:{email:email},data:{password: user.password}});
          return h.response({message: "Failed to send Password Reset Email"}).code(404);
        }
        logger.info("Password reset Successfully",RequestType.UPDATE,user.name);
      }else if(isPatient === true){
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await executePrismaMethod(prisma,"patient","update",{
          where:{
            email: email
          },
          data:{
            password: hashPassword,
            updatedAt: getCurrentDate()
          }
        });

        if(!user){
          logger.error("Failed to reset password",RequestType.UPDATE,user.name);
          return h.response({message: "Failed to reset password"}).code(404);
        }
        name = user.name;
        const sendMail = await passwordResetEmail(email,name);
        if(sendMail !== "Email sent"){
          logger.error("Failed to send Password Reset Email",RequestType.UPDATE,user.name);
          await executePrismaMethod(prisma,"patient","update",{where:{email:email},data:{password: user.password}});
          return h.response({message: "Failed to send Password Reset Email"}).code(404);
        }
        logger.info("Password reset Successfully",RequestType.UPDATE,user.name);
      }else{
        logger.error("User not found",RequestType.READ,email);
        return h.response({message: "User not found"}).code(404);
      }
      
      return h.response({message: "Password reset Successfully"}).code(201);

    }catch(err:any){
        logger.error("Internal Server Error occurred, failed to reset password",RequestType.UPDATE,name,err.toString());
        return h.response({message: "Internal Server Error occurred, failed to reset password"}).code(500);
    }
}


/** DOCTOR Handlers */
// create a doctor
export async function createDoctorHandler(request:Hapi.Request,h: Hapi.ResponseToolkit){
    const { prisma, logger} = request.server.app;
    const { email, name, password, specialty, available } = request.payload as DoctorModel;
    const Requester = "New Doctor"

    try{
         const checkIfUserExist = await executePrismaMethod(
           prisma,
           "doctor",
           "findUnique",
           {
             where: {
               email: email,
             },
           }
         );
         
         if(checkIfUserExist){
            logger.error(
              "Doctor Account already exists!",
              RequestType.READ,
              Requester
            );
            return h.response({message: " Doctor Account already exist!"}).code(400);
         }

        const hashPassword = await bcrypt.hash(password, 10);

        const Doctor = await executePrismaMethod(prisma, "doctor", "create", {
          data: {
            email: email,
            name: name,
            password: hashPassword,
            specialty: specialty || " ",
            available: available || false,
            createdAt: getCurrentDate(),
            updatedAt: getCurrentDate(),
          },
        });

        if(!Doctor){
          logger.error(
            "Failed to create Doctor",
            RequestType.CREATE,
            Requester,
            Doctor.toString()
          );   
        }

        const token = generateAuthToken(
           name,
           email,
           TokenType.DOCTOR,
           Doctor.id,
           "doctor"
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
             Requester,
             DoctorToken.toString()
           );
           return h.response({ message: "Failed to create Doctor Token" }).code(404);
        }
        const sendMail = await doctorAccountCreationEmail(email,name,password);
        if(sendMail !== "Email sent"){
         
          await executePrismaMethod(prisma,"token","delete",{where:{id:DoctorToken.id}});
          await executePrismaMethod(prisma,"doctor","delete",{where:{id:Doctor.id}});
          logger.error(
            "Failed to send Account Creation Email",
            RequestType.CREATE,
            Requester,
            sendMail.toString()
          );
          return h.response({ message: "Failed to send Account Creation Email" }).code(404);
        }
        logger.info("Doctor " + name + " was Successfully created!",RequestType.CREATE,Requester);
        return h.response({message: "Doctor " + name + " was Successfully created!",}).code(201);

    }
    catch(err:any){
        logger.error("Internal Server Error occurred, failed to create Doctor " + name + "'s Account",RequestType.CREATE,Requester,err.toString());
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
    console.log("starting...")
    const doctors = await executePrismaMethod(prisma,"doctor","findMany",{
      select: {
        id: true,
        name: true,
        email: true,
        available: true,
        specialty: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if(!doctors){
      logger.error("Failed to fetch Doctors",RequestType.READ,name);
      return h.response({message: "Failed to fetch Doctors"}).code(404);
    }
    console.log("doctors available")
    let AllDoctors: any[] = [];
    for(const doctor of doctors) {
      let status = "Unavailable";
      let id = 1;
      if(doctor.available === true){
        status = "Available"
      }
      const data = {
        id:id,
        doctorId: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty,
        workStatus: status,
      }
      AllDoctors.push(data);
      id++
    }
    logger.info("Doctors fetched Successfully",RequestType.READ,name);
    return h.response(AllDoctors).code(200);

  }catch(err:any){
    logger.error("Internal Server Error occurred, failed to fetch Doctors",RequestType.READ,name,err.toString());
    return h.response({message: "Internal Server Error occurred, failed to fetch Doctors"}).code(500);
  }

}
// update a doctor
export async function updateDoctorHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { doctorId } = request.params;
  const { name, email, specialty,available } = request.payload as DoctorModel;
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
        name: name || checkIfUserExist.name,
        specialty: specialty || checkIfUserExist.specialty,
        available: available || checkIfUserExist.available,
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
     const token = await executePrismaMethod(prisma,"token","delete",{
      where:{
        type: TokenType.DOCTOR,
        patientId: doctorId
      }
    });

     if(!token){
      logger.error("Failed to delete token",RequestType.DELETE,name);
      return h.response({message: "Failed to delete token"}).code(404);
    }
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
// get a doctor
export async function getDoctorHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { doctorId } = request.params;
  const { name } = request.auth.credentials;

  try{
    const doctor = await executePrismaMethod(prisma,"doctor","findUnique",{
      where:{
        id: doctorId
      }
    });

    if(!doctor){
      logger.error("Failed to fetch Doctor",RequestType.READ,name);
      return h.response({message: "Failed to fetch Doctor"}).code(404);
    }
    const data = {
      id:doctor.id,
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
      available: doctor.available,
      createdAt: doctor.createdAt,
      updateAt: doctor.updateAt,
    }

    logger.info("Doctor fetched Successfully",RequestType.READ,name);
    return h.response(data).code(200);

  }catch(err:any){
    logger.error("Internal Server Error occurred, failed to fetch Doctor",RequestType.READ,name,err.toString());
    return h.response({message: "Internal Server Error occurred, failed to fetch Doctor"}).code(500);
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
  const Requester = "New Patient"

  try {
    const checkIfUserExist = await executePrismaMethod(
      prisma,
      "patient",
      "findUnique",
      {
        where: {
          email: email,
        },
      }
    );

    if (checkIfUserExist) {
      logger.error(
        "Patient Account already exists!",
        RequestType.READ,
        Requester
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
        Requester,
        Patient.toString()
      );
    }

    const token = generateAuthToken(name, email, TokenType.PATIENT, Patient.id,"patient");

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
        Requester,
        PatientToken.toString()
      );
      return h.response({ message: "Failed to create Patient Token" }).code(404);
    }
    
    const sendMail = await patientAccountCreationEmail(email,name,password);
    if(sendMail !== "Email sent"){
      
      await executePrismaMethod(prisma,"token","delete",{where:{id:PatientToken.id}});
      await executePrismaMethod(prisma,"patient","delete",{where:{id:Patient.id}});
      logger.error(
        "Failed to send Account Creation Email",
        RequestType.CREATE,
        Requester,
        sendMail.toString()
      );
      return h.response({ message: "Failed to send Account Creation Email" }).code(404);
    }
    logger.info( 
      name + " was Successfully created!",
      RequestType.CREATE,
      Requester
    );
    return h
      .response({ message:name + " was Successfully created!" })
      .code(201);
  } catch (err: any) {
    logger.error(
      "Internal Server Error occurred, failed to create" + name +
        "'s Account",
      RequestType.CREATE,
      Requester,
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
  const {name,userId,userType} = request.auth.credentials;
  let adminId = 0;
  if(userType === "admin"){
    adminId = userId;
  }
  try{
    const patients = await executePrismaMethod(prisma,"patient","findMany",{
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updateAt: true,
      }
    });

    if(!patients){
      logger.error("Failed to fetch Patients",RequestType.READ,name);
      return h.response({message: "Failed to fetch Patients"}).code(404);
    }
    let AllPatients: any[] = [];
    if(adminId) {
      for(const patient of patients) {
        let id = 1;
        const data = {
          id:id,
          patientId: patient.id,
          name: patient.name,
          email: patient.email,
          createdAt: patient.createdAt,
          updateAt: patient.updateAt,
        }
        AllPatients.push(data);
        id++
      }
    }else{
      for(const patient of patients){
        let id = 1;
        const data = {
          id:id,
          patientId: patient.id,
          name: patient.name,
          email: patient.email,
        }
        AllPatients.push(data);
        id++
      }
    }

    logger.info("Patients fetched Successfully",RequestType.READ,name);
    return h.response(AllPatients).code(200);

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
        name: name || checkIfUserExist.name,
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
    const token = await executePrismaMethod(prisma,"token","delete",{
      where:{
        type: TokenType.PATIENT,
        patientId: patientId
      }
    });

     if(!token){
      logger.error("Failed to delete token",RequestType.DELETE,name);
      return h.response({message: "Failed to delete token"}).code(404);
    }

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
// get a patient
export async function getPatientHandler(request:Hapi.Request,h:Hapi.ResponseToolkit){
  const { prisma,logger} = request.server.app;
  const { patientId } = request.params;
  const { name } = request.auth.credentials;

  try{
    const patient = await executePrismaMethod(prisma,"patient","findUnique",{
      where:{
        id: patientId
      }
    });

    if(!patient){
      logger.error("Failed to fetch Patient",RequestType.READ,name);
      return h.response({message: "Failed to fetch Patient"}).code(404);
    }
    const data = {
      id:patient.id,
      patientId: patient.id,
      name: patient.name,
      email: patient.email,
      createdAt: patient.createdAt,
      updateAt: patient.updateAt,
    }

    logger.info("Patient fetched Successfully",RequestType.READ,name);
    return h.response(data).code(200);

  }catch(err:any){
    logger.error("Internal Server Error occurred, failed to fetch Patient",RequestType.READ,name,err.toString());
    return h.response({message: "Internal Server Error occurred, failed to fetch Patient"}).code(500);
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
  let userType = "";
  try {
    let user;
    if (role === Role.DOCTOR) {
      userType = Role.DOCTOR;
      user = await executePrismaMethod(prisma, "doctor", "findUnique", {
        where: {
          email: email,
        },
      });
    } else if (role === Role.PATIENT) {
      userType = Role.PATIENT;
      user = await executePrismaMethod(prisma, "patient", "findUnique", {
        where: {
          email: email,
        },
      });
    } else if (role === Role.ADMIN) {
      userType = Role.ADMIN;
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
    const findToken = await executePrismaMethod(prisma, "token", "findUnique", {
      where: {
        type: role.toUpperCase(),
        [role.toUpperCase() === TokenType.DOCTOR ? "doctorId" : role.toUpperCase() === TokenType.PATIENT ? "patientId" : "adminId"]: user.id,
      },
    });
    const token = generateAuthToken(user.name, email, findToken.type, user.id,userType);

    const expiration = add(new Date(), {
      minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
    });

    const Token = await executePrismaMethod(prisma, "token", "update", {
      where:{
        type: role.toUpperCase(),
        [role.toUpperCase() === TokenType.DOCTOR ? "doctorId" : role.toUpperCase() === TokenType.PATIENT ? "patientId" : "adminId"]: user.id,
      },
      data: {
        valid: true,
        expiration: expiration,
        Token: token,
        updatedAt: getCurrentDate(),
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
    console.log("token is vallid: ",checkIfTokenExist);

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

    console.log("Token updated",Token);

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


/** Patient-Doctor Assignment */
// Assign doctor to patient
export async function assignDoctorToPatientHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, logger } = request.server.app;
  const { doctorId } = request.payload as { doctorId: number };
  const { userId,userType, name } = request.auth.credentials;
  let patientId = 0;
  if(userType === "patient"){
    patientId = userId;
  }

  
  try {
    // Check if doctor exists
    const doctor = await executePrismaMethod(prisma, "doctor", "findUnique", {
      where: {
        id: doctorId
      }
    });
    
    if (!doctor) {
      logger.error(`Doctor not found with id ${doctorId}`, RequestType.READ, name);
      return h.response({ message: "Doctor not found" }).code(404);
    }
    
    // Update patient with selected doctor
    const patient = await executePrismaMethod(prisma, "patient", "update", {
      where: {
        id: patientId
      },
      data: {
        doctorId: doctorId,
        updatedAt: getCurrentDate()
      }
    });
    
    if (!patient) {
      logger.error(`Failed to assign doctor to patient ${patientId}`, RequestType.UPDATE, name);
      return h.response({ message: "Failed to assign doctor" }).code(500);
    }
    
    logger.info(`Doctor ${doctorId} assigned to patient ${patientId} successfully`, RequestType.UPDATE, name);
    return h.response({ message: "Doctor assigned successfully" }).code(200);
  } catch (err: any) {
    logger.error(`Internal Server Error occurred, failed to assign doctor: ${err.toString()}`, RequestType.UPDATE, name);
    return h.response({ message: "Internal Server Error occurred, failed to assign doctor" }).code(500);
  }
}
// Get all patients assigned to a doctor
export async function getDoctorPatientsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, logger } = request.server.app;
  const doctorId = request.params.doctorId;
  const {name } = request.auth.credentials;
  

  try {
    const patients = await executePrismaMethod(prisma, "patient", "findMany", {
      where: {
        doctorId: doctorId
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
    
    let AllPatients: any[] = [];
    for(const patient of patients){
      let id = 1;
      const data = {
        id: id,
        patientId: patient.id,
        email: patient.email,
        name: patient.name
      }
      AllPatients.push(data);
      id++
    }
    logger.info(`Retrieved ${patients.length} patients for doctor ${doctorId}`, RequestType.READ, name);
    return h.response(AllPatients).code(200);
  } catch (err: any) {
    logger.error(`Internal Server Error occurred, failed to retrieve doctor's patients: ${err.toString()}`, RequestType.READ, name);
    return h.response({ message: "Internal Server Error occurred, failed to retrieve patients" }).code(500);
  }
}
// Get all available doctors (for patient selection)
export async function getAvailableDoctorsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, logger } = request.server.app;
  const { name } = request.auth.credentials;
  
  try {
    const doctors = await executePrismaMethod(prisma, "doctor", "findMany", {
      where:{
        available: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true
      }
    });
     let AllDoctors: any[] = [];
    for(const doctor of doctors) {
      let id = 1;
      const data = {
        id:id,
        doctorId: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty,
      }
      AllDoctors.push(data);
      id++
    }
    logger.info(`Retrieved ${doctors.length} available doctors`, RequestType.READ, name);
    return h.response(AllDoctors).code(200);
  } catch (err: any) {
    logger.error(`Internal Server Error occurred, failed to retrieve available doctors: ${err.toString()}`, RequestType.READ, name);
    return h.response({ message: "Internal Server Error occurred, failed to retrieve doctors" }).code(500);
  }
}
// admin assign patient to doctor
export async function adminAssignDoctorToPatientHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma, logger } = request.server.app;
  const { doctorId, patientId } = request.payload as { doctorId: number, patientId: number };
  const { name } = request.auth.credentials;
  
  try {
    // Check if doctor exists
    const doctor = await executePrismaMethod(prisma, "doctor", "findUnique", {
      where: {
        id: doctorId
      }
    });
    
    if (!doctor) {
      logger.error(`Doctor not found with id ${doctorId}`, RequestType.READ, name);
      return h.response({ message: "Doctor not found" }).code(404);
    }

    // Check if patient exists
    const patientExists = await executePrismaMethod(prisma, "patient", "findUnique", {
      where: {
        id: patientId
      }
    });
    
    if (!patientExists) {
      logger.error(`Patient not found with id ${patientId}`, RequestType.READ, name);
      return h.response({ message: "Patient not found" }).code(404);
    }
    
    // Update patient with selected doctor
    const patient = await executePrismaMethod(prisma, "patient", "update", {
      where: {
        id: patientId
      },
      data: {
        doctorId: doctorId,
        updatedAt: getCurrentDate()
      }
    });
    
    if (!patient) {
      logger.error(`Failed to assign doctor to patient ${patientId}`, RequestType.UPDATE, name);
      return h.response({ message: "Failed to assign doctor" }).code(500);
    }
    
    logger.info(`Admin ${name} assigned doctor ${doctorId} to patient ${patientId}`, RequestType.UPDATE, name);
    return h.response({ 
      message: "Doctor assigned successfully",
      patient: {
        id: patient.id,
        name: patient.name,
        doctorId: patient.doctorId
      }
    }).code(200);
  } catch (err: any) {
    logger.error(`Internal Server Error occurred, failed to assign doctor: ${err.toString()}`, RequestType.UPDATE, name);
    return h.response({ message: "Internal Server Error occurred, failed to assign doctor" }).code(500);
  }
}