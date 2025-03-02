"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = void 0;
exports.validateAPIToken = validateAPIToken;
exports.isUserDoctor = isUserDoctor;
exports.isUserAdmin = isUserAdmin;
exports.isUserPatient = isUserPatient;
exports.isDoctorOrAdmin = isDoctorOrAdmin;
exports.isPatientOrAdmin = isPatientOrAdmin;
const Helpers_1 = require("../Helpers");
exports.AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
async function validateAPIToken(decoded, request, h) {
    const { prisma, logger } = request.server.app;
    const { email, userId, name, userType } = decoded;
    // Map userType to TokenType enum
    const tokenType = Helpers_1.TokenType[userType.toUpperCase()];
    if (!tokenType) {
        logger.error(`Invalid user type: ${userType}`, Helpers_1.RequestType.READ, "validation Request");
        return h.response({ message: "Invalid user type" }).code(403);
    }
    // Use dynamic key for the foreign key based on user type
    const foreignKeyField = `${userType.toLowerCase()}Id`;
    const decodedTokenId = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
        where: {
            [foreignKeyField]: userId,
            type: tokenType,
        },
        select: {
            id: true,
        },
    });
    if (!decodedTokenId) {
        logger.error("Invalid credentials", Helpers_1.RequestType.READ, "validation Request");
        return h.response({ message: "Invalid credentials" }).code(403);
    }
    const tokenId = decodedTokenId.id;
    try {
        const getTokenData = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
            where: {
                id: tokenId,
                [foreignKeyField]: userId,
            },
        });
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
        const user = await (0, Helpers_1.executePrismaMethod)(prisma, userModel, "findUnique", {
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
                userType: userType.toLowerCase(),
                tokenId: getTokenData.id,
                email: email,
                name: name,
            },
        };
    }
    catch (err) {
        request.log(["error", "auth", "db"], `Failed to get information from database: ${err}`);
        return {
            isValid: false,
            errorMessage: "Validation Error, failed to get information from database",
        };
    }
}
async function isUserDoctor(request, h) {
    const { userId, userType, email } = request.auth.credentials;
    const { prisma } = request.server.app;
    let doctorId = "";
    if (userType === "doctor") {
        doctorId = userId;
    }
    else {
        return h.response({ message: "Not authorized!!" }).code(403);
    }
    const checkIfIsDoctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findFirst", {
        where: {
            id: doctorId,
            email: email
        }
    });
    if (!checkIfIsDoctor) {
        return h.response({ message: "Not authorized!!" }).code(403);
    }
    return h.continue;
}
async function isUserAdmin(request, h) {
    const { userId, userType, email } = request.auth.credentials;
    const { prisma } = request.server.app;
    let adminId = "";
    if (userType === "admin") {
        adminId = userId;
    }
    else {
        return h.response({ message: "Not authorized!!" }).code;
    }
    const checkIfIsAdmin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findFirst", {
        where: {
            id: adminId,
            email: email,
        },
    });
    if (!checkIfIsAdmin) {
        return h.response({ message: "Not authorized!!" }).code(403);
    }
    return h.continue;
}
async function isUserPatient(request, h) {
    const { userId, userType, email } = request.auth.credentials;
    const { prisma } = request.server.app;
    let patientId = "";
    if (userType === "patient") {
        patientId = userId;
    }
    else {
        return h.response({ message: "Not authorized!!" }).code(403);
    }
    const checkIfIsPatient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findFirst", {
        where: {
            id: patientId,
            email: email,
        },
    });
    if (!checkIfIsPatient) {
        return h.response({ message: "Not authorized!!" }).code(403);
    }
    return h.continue;
}
async function isDoctorOrAdmin(request, h) {
    const credentials = request.auth.credentials;
    const { prisma } = request.server.app;
    let isDoctor = false;
    let isAdmin = false;
    if (credentials.userType === "doctor" || credentials.userType === "admin") {
        if (credentials.userId === "doctor") {
            const doctorId = credentials.userId;
            const checkIfIsDoctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findFirst", {
                where: {
                    id: doctorId,
                    email: credentials.email
                }
            });
            if (!checkIfIsDoctor) {
                return h.response({ message: "Not authorized!!" }).code(403);
            }
            isDoctor = true;
        }
        else if (credentials.userId === "admin") {
            const adminId = credentials.userId;
            const checkIfIsAdmin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findFirst", {
                where: {
                    id: adminId,
                    email: credentials.email
                }
            });
            if (!checkIfIsAdmin) {
                return h.response({ message: "Not authorized!!" }).code(403);
            }
            isAdmin = true;
        }
        else {
            return h.response({ message: "Not authorized!!" }).code(403);
        }
        if (isDoctor || isAdmin) {
            return h.continue;
        }
    }
}
async function isPatientOrAdmin(request, h) {
    const credentials = request.auth.credentials;
    const { prisma } = request.server.app;
    let isPatient = false;
    let isAdmin = false;
    if (credentials.userType === "patient" || credentials.userType === "admin") {
        if (credentials.userType === "patient") {
            const patientId = credentials.userId;
            const checkIfIsPatient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findFirst", {
                where: {
                    id: patientId,
                    email: credentials.email
                }
            });
            if (!checkIfIsPatient) {
                return h.response({ message: "Not authorized!!" }).code(403);
            }
            isPatient = true;
        }
        else if (credentials.userType === "admin") {
            const adminId = credentials.userId;
            const checkIfIsAdmin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findFirst", {
                where: {
                    id: adminId,
                    email: credentials.email
                }
            });
            if (!checkIfIsAdmin) {
                return h.response({ message: "Not authorized!!" }).code(403);
            }
            isAdmin = true;
        }
        else {
            return h.response({ message: "Not authorized!!" }).code(403);
        }
        if (isPatient || isAdmin) {
            return h.continue;
        }
    }
}
//# sourceMappingURL=authHelpers.js.map