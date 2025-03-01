import * as Hapi from "@hapi/hapi";
import Joi from "joi";
import { executePrismaMethod, RequestType, TokenType } from "../Helpers";
import { APITokenPayload } from "../Models";

export const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;

export async function doctorValidateAPIToken(
  decoded: APITokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma, logger } = request.server.app;
  const { email, doctorId, name } = decoded;

  const decodedTokenId = await executePrismaMethod(
    prisma,
    "token",
    "findUnique",
    {
      where: {
        doctorId: doctorId,
        type: TokenType.DOCTOR,
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
          doctorId: doctorId,
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
    const doctor = await executePrismaMethod(prisma, "doctor", "findUique", {
      where: {
        id: doctorId,
        email: email,
      },
    });
    if (!doctor) {
      return {
        isValid: false,
        errorMessage: "Doctor does not exist",
      };
    }

    return {
      isValid: true,
      credentials: {
        doctorId: doctor.id,
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
  const { doctorId,email} = request.auth.credentials;
  const {prisma} = request.server.app;

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

export async function adminValidateAPIToken(
  decoded: APITokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma, logger } = request.server.app;
  const { email, adminId, name } = decoded;

  const decodedTokenId = await executePrismaMethod(
    prisma,
    "token",
    "findUnique",
    {
      where: {
        adminId: adminId,
        type: TokenType.ADMIN,
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
          adminId: adminId,
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
    const admin = await executePrismaMethod(prisma, "admin", "findUique", {
      where: {
        id: adminId,
        email: email,
      },
    });
    if (!admin) {
      return {
        isValid: false,
        errorMessage: "Admin does not exist",
      };
    }

    return {
      isValid: true,
      credentials: {
        adminId: admin.id,
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
export async function isUserAdmin(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { adminId, email } = request.auth.credentials;
  const { prisma } = request.server.app;

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
export async function patientValidateAPIToken(
  decoded: APITokenPayload,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma, logger } = request.server.app;
  const { email, patientId, name } = decoded;

  const decodedTokenId = await executePrismaMethod(
    prisma,
    "token",
    "findUnique",
    {
      where: {
        patientId: patientId,
        type: TokenType.PATIENT,
      },
      select: {
        id: true,
      },
    }
  );

  if (!decodedTokenId) {
    logger.error("Invalid credentials", RequestType.READ, "validation Request");
    return h.response({message:"Invalid credentials"}).code(403);
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
          patientId: patientId,
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
    const patient = await executePrismaMethod(prisma, "patient", "findUique", {
      where: {
        id: patientId,
        email: email,
      },
    });
    if (!patient) {
      return {
        isValid: false,
        errorMessage: "Patient does not exist",
      };
    }

    return {
      isValid: true,
      credentials: {
        patientId: patient.id,
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
export async function isUserPatient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { patientId, email } = request.auth.credentials;
  const { prisma } = request.server.app;

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
  if(credentials.doctorId !== null || credentials.doctorId !== undefined){
    const checkIfIsDoctor = await executePrismaMethod(prisma,"doctor","findFirst",{
        where:{
          id:credentials.doctorId,
          email: credentials.email
        }
    });

    if(!checkIfIsDoctor){
      return h.response({message: "Not authorized!!"}).code(403);
    }

    isDoctor = true;
  } else if(credentials.adminId !== null || credentials.adminId !== undefined){
     const checkIfIsAdmin = await executePrismaMethod(prisma,"admin","findFirst",{
        where:{
          id:credentials.adminId,
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

export async function isPatientOrAdmin( request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const credentials = request.auth.credentials;
  const {prisma} = request.server.app;
  let isPatient = false;
  let isAdmin = false;
  if(credentials.patientId !== null || credentials.patientId !== undefined){
    const checkIfIsPatient = await executePrismaMethod(prisma,"patient","findFirst",{
        where:{
          id:credentials.doctorId,
          email: credentials.email
        }
    });

    if(!checkIfIsPatient){
      return h.response({message: "Not authorized!!"}).code(403);
    }

    isPatient = true;
  } else if(credentials.adminId !== null || credentials.adminId !== undefined){
     const checkIfIsAdmin = await executePrismaMethod(prisma,"admin","findFirst",{
        where:{
          id:credentials.adminId,
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