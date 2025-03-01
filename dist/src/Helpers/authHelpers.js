"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = void 0;
exports.doctorValidateAPIToken = doctorValidateAPIToken;
exports.isUserDoctor = isUserDoctor;
exports.adminValidateAPIToken = adminValidateAPIToken;
exports.isUserAdmin = isUserAdmin;
exports.patientValidateAPIToken = patientValidateAPIToken;
exports.isUserPatient = isUserPatient;
exports.isDoctorOrAdmin = isDoctorOrAdmin;
exports.isPatientOrAdmin = isPatientOrAdmin;
const Helpers_1 = require("../Helpers");
exports.AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
async function doctorValidateAPIToken(decoded, request, h) {
    const { prisma, logger } = request.server.app;
    const { email, doctorId, name } = decoded;
    const decodedTokenId = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
        where: {
            doctorId: doctorId,
            type: Helpers_1.TokenType.DOCTOR,
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
                doctorId: doctorId,
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
        const doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUique", {
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
    const { doctorId, email } = request.auth.credentials;
    const { prisma } = request.server.app;
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
async function adminValidateAPIToken(decoded, request, h) {
    const { prisma, logger } = request.server.app;
    const { email, adminId, name } = decoded;
    const decodedTokenId = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
        where: {
            adminId: adminId,
            type: Helpers_1.TokenType.ADMIN,
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
                adminId: adminId,
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
        const admin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findUique", {
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
    }
    catch (err) {
        request.log(["error", "auth", "db"], `Failed to get information from database: ${err}`);
        return {
            isValid: false,
            errorMessage: "Validation Error, failed to get information from database",
        };
    }
}
async function isUserAdmin(request, h) {
    const { adminId, email } = request.auth.credentials;
    const { prisma } = request.server.app;
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
async function patientValidateAPIToken(decoded, request, h) {
    const { prisma, logger } = request.server.app;
    const { email, patientId, name } = decoded;
    const decodedTokenId = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
        where: {
            patientId: patientId,
            type: Helpers_1.TokenType.PATIENT,
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
                patientId: patientId,
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
        const patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUique", {
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
    }
    catch (err) {
        request.log(["error", "auth", "db"], `Failed to get information from database: ${err}`);
        return {
            isValid: false,
            errorMessage: "Validation Error, failed to get information from database",
        };
    }
}
async function isUserPatient(request, h) {
    const { patientId, email } = request.auth.credentials;
    const { prisma } = request.server.app;
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
    if (credentials.doctorId !== null || credentials.doctorId !== undefined) {
        const checkIfIsDoctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findFirst", {
            where: {
                id: credentials.doctorId,
                email: credentials.email
            }
        });
        if (!checkIfIsDoctor) {
            return h.response({ message: "Not authorized!!" }).code(403);
        }
        isDoctor = true;
    }
    else if (credentials.adminId !== null || credentials.adminId !== undefined) {
        const checkIfIsAdmin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findFirst", {
            where: {
                id: credentials.adminId,
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
async function isPatientOrAdmin(request, h) {
    const credentials = request.auth.credentials;
    const { prisma } = request.server.app;
    let isPatient = false;
    let isAdmin = false;
    if (credentials.patientId !== null || credentials.patientId !== undefined) {
        const checkIfIsPatient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findFirst", {
            where: {
                id: credentials.doctorId,
                email: credentials.email
            }
        });
        if (!checkIfIsPatient) {
            return h.response({ message: "Not authorized!!" }).code(403);
        }
        isPatient = true;
    }
    else if (credentials.adminId !== null || credentials.adminId !== undefined) {
        const checkIfIsAdmin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findFirst", {
            where: {
                id: credentials.adminId,
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
//# sourceMappingURL=authHelpers.js.map