import * as Hapi from "@hapi/hapi";
import Joi from "joi";
import { executePrismaMethod, RequestType, TokenType } from "../Helpers";
import { APITokenPayload } from "../Models";

export const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;

export interface UserAPITokenPayload {
  email: string;
  userId: string;
  name: string;
  userType: string; // E.g., 'DOCTOR', 'PATIENT', 'ADMIN', etc.
}

export async function validateAPIToken(
  decoded: UserAPITokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma, logger } = request.server.app;
  const { email, userId, name, userType } = decoded;

  // Map userType to TokenType enum
  const tokenType = TokenType[userType];
  if (!tokenType) {
    logger.error(`Invalid user type: ${userType}`, RequestType.READ, "validation Request");
    return h.response({ message: "Invalid user type" }).code(403);
  }

  // Use dynamic key for the foreign key based on user type
  const foreignKeyField = `${userType.toLowerCase()}Id`;

  const decodedTokenId = await executePrismaMethod(
    prisma,
    "token",
    "findUnique",
    {
      where: {
        [foreignKeyField]: userId,
        type: tokenType,
      },
      select: {
        id: true,
      },
    }
  );

  if (!decodedTokenId) {
    logger.error("Invalid credentials", RequestType.READ, "validation Request");
    return h.response({ message: "Invalid credentials" }).code(403);
  }

  const tokenId = decodedTokenId.id;

  try {
    const getTokenData = await executePrismaMethod(
      prisma,
      "token",
      "findUnique",
      {
        where: {
          id: tokenId,
          [foreignKeyField]: userId,
        },
      }
    );

    if (!getTokenData || !getTokenData?.valid) {
      return {
        isValid: false,
        errorMessage: "token does not exist or is invalid",
      };
    }

    if (getTokenData.expiration < new Date()) {
      return { isValid: false, errorMessage: "Expired token" };
    }

    // Get user model name from userType (lowercase first letter)
    const userModel = userType.toLowerCase();
    const user = await executePrismaMethod(prisma, userModel, "findUnique", {
      where: {
        id: userId,
        email: email,
      },
    });

    if (!user) {
      return {
        isValid: false,
        errorMessage: `${userType} does not exist`,
      };
    }

    return {
      isValid: true,
      credentials: {
        userId: user.id,
        userType: foreignKeyField,
        tokenId: getTokenData.id,
        email: email,
        name: name,
      },
    };
  } catch (err) {
    request.log(
      ["error", "auth", "db"],
      `Failed to get information from database: ${err}`
    );

    return {
      isValid: false,
      errorMessage: "Validation Error, failed to get information from database",
    };
  }
}



export async function isUserDoctor(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { userId,userType,email} = request.auth.credentials;
  const {prisma} = request.server.app;
  let doctorId = "";
  if(userType === "doctor"){
    doctorId = userId;
  }else{
    return h.response({message: "Not authorized!!"}).code(403);
  }
  const checkIfIsDoctor = await executePrismaMethod(prisma,"doctor","findFirst",{
    where:{
      id:doctorId,
      email: email
    }
  });

  if(!checkIfIsDoctor){
    return h.response({message: "Not authorized!!"}).code(403);
  }

  return h.continue;
}


export async function isUserAdmin(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId,userType, email } = request.auth.credentials;
  const { prisma } = request.server.app;

  let adminId = "";
  if(userType === "admin"){
    adminId = userId;
  }else{
    return h.response({message: "Not authorized!!"}).code
  }
  const checkIfIsAdmin = await executePrismaMethod(
    prisma,
    "admin",
    "findFirst",
    {
      where: {
        id: adminId,
        email: email,
      },
    }
  );

  if (!checkIfIsAdmin) {
    return h.response({ message: "Not authorized!!" }).code(403);
  }

  return h.continue;
}

export async function isUserPatient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId,userType, email } = request.auth.credentials;
  const { prisma } = request.server.app;

  let patientId = "";
  if(userType === "patient"){
    patientId = userId;
  }else{
    return h.response({message: "Not authorized!!"}).code(403);
  }
  const checkIfIsPatient = await executePrismaMethod(
    prisma,
    "patient",
    "findFirst",
    {
      where: {
        id: patientId,
        email: email,
      },
    }
  );

  if (!checkIfIsPatient) {
    return h.response({ message: "Not authorized!!" }).code(403);
  }

  return h.continue;
}

export async function isDoctorOrAdmin( request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const credentials = request.auth.credentials;
  const {prisma} = request.server.app;
  let isDoctor = false;
  let isAdmin = false;
  if(credentials.userType === "doctor" || credentials.userType === "admin"){

    if(credentials.userId === "doctor"){
      const doctorId = credentials.userId;
      const checkIfIsDoctor = await executePrismaMethod(prisma,"doctor","findFirst",{
          where:{
            id:doctorId,
            email: credentials.email
          }
      });

      if(!checkIfIsDoctor){
        return h.response({message: "Not authorized!!"}).code(403);
      }

      isDoctor = true;
    }
    else if(credentials.userId === "admin"){
        const adminId = credentials.userId;
      const checkIfIsAdmin = await executePrismaMethod(prisma,"admin","findFirst",{
          where:{
            id:adminId,
            email: credentials.email
          }
      });

      if(!checkIfIsAdmin){
        return h.response({message: "Not authorized!!"}).code(403);
      }

      isAdmin = true;

    }else{
      return h.response({message: "Not authorized!!"}).code(403);
    }

    if(isDoctor || isAdmin) {
      return h.continue;
    }
  }
}

export async function isPatientOrAdmin( request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const credentials = request.auth.credentials;
  const {prisma} = request.server.app;
  let isPatient = false;
  let isAdmin = false;
  if(credentials.userType === "patient" || credentials.userType === "admin"){
    if(credentials.userType === "patient"){
      const patientId = credentials.userId;
      const checkIfIsPatient = await executePrismaMethod(prisma,"patient","findFirst",{
          where:{
            id:patientId,
            email: credentials.email
          }
      });

      if(!checkIfIsPatient){
        return h.response({message: "Not authorized!!"}).code(403);
      }

      isPatient = true;
    } else if(credentials.userType === "admin"){
      const adminId = credentials.userId
      const checkIfIsAdmin = await executePrismaMethod(prisma,"admin","findFirst",{
          where:{
            id:adminId,
            email: credentials.email
          }
      });

      if(!checkIfIsAdmin){
        return h.response({message: "Not authorized!!"}).code(403);
      }

      isAdmin = true;

    }else{
      return h.response({message: "Not authorized!!"}).code(403);
    }
    
    if(isPatient || isAdmin) {
      return h.continue;
    }
  }
}