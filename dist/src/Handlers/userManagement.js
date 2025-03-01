"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
exports.createDoctorHandler = createDoctorHandler;
exports.createPatientHandler = createPatientHandler;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const server_1 = __importDefault(require("../server"));
const Helpers_1 = require("../Helpers");
const date_fns_1 = require("date-fns");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
function generateAuthToken(name, email, tokenType, userId) {
    const jwtPayload = { name, email, tokenType, userId };
    return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        noTimestamp: true,
    });
}
function decodeAuthToken(token) {
    try {
        const verifyToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (verifyToken) {
            return jsonwebtoken_1.default.decode(token);
        }
    }
    catch (error) {
        console.error("Error decoding token:", error);
        return null; // Return null or throw an error, depending on your use case
    }
}
/** ADMIN Handlers */
async function createAdmin(userDate) {
    const { prisma, logger } = server_1.default.app;
    const { email, name, password } = userDate;
    try {
        // check if admin exists
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findUnique", {
            where: {
                email: email,
                name: name
            }
        });
        if (checkIfUserExist) {
            logger.error("Admin Account already exists!", Helpers_1.RequestType.READ, "admin");
            throw Error("Admin Account already exists!");
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const Admin = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "create", {
            data: {
                email: email,
                name: name,
                password: hashPassword,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)()
            }
        });
        if (!Admin) {
            logger.error("Failed to create Admin", Helpers_1.RequestType.CREATE, name, Admin.toString());
            throw Error("Failed to create Admin");
        }
        const token = generateAuthToken(name, email, Helpers_1.TokenType.ADMIN, Admin.id);
        const expiration = (0, date_fns_1.add)(new Date(), { minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES, });
        const AdminToken = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "create", {
            type: Helpers_1.TokenType.ADMIN,
            valid: true,
            expiration: expiration,
            Token: token,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            adminId: Admin.id,
        });
        if (!AdminToken) {
            logger.error("Failed to create Admin Token", Helpers_1.RequestType.CREATE, name, AdminToken.toString());
            throw Error("Failed to create Admin Token");
        }
        return " Admin created Successfully!";
    }
    catch (err) {
        throw Error(err.toString());
    }
}
/** DOCTOR Handlers */
async function createDoctorHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { email, name, password, specialty } = request.payload;
    const credentials = request.auth.credentials;
    try {
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", {
            where: {
                email: email,
                name: name,
                specialty: specialty
            },
        });
        if (checkIfUserExist) {
            logger.error("Doctor Account already exists!", Helpers_1.RequestType.READ, credentials.name);
            return h.response({ message: " Doctor Account already exist!" }).code(400);
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const Doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "create", {
            data: {
                email: email,
                name: name,
                password: hashPassword,
                specialty: specialty,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        if (!Doctor) {
            logger.error("Failed to create Doctor", Helpers_1.RequestType.CREATE, credentials.name, Doctor.toString());
        }
        const token = generateAuthToken(name, email, Helpers_1.TokenType.DOCTOR, Doctor.id);
        const expiration = (0, date_fns_1.add)(new Date(), {
            minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
        });
        const DoctorToken = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "create", {
            type: Helpers_1.TokenType.DOCTOR,
            valid: true,
            expiration: expiration,
            Token: token,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            doctorId: Doctor.id,
        });
        if (!DoctorToken) {
            logger.error("Failed to create Doctor Token", Helpers_1.RequestType.CREATE, credentials.name, DoctorToken.toString());
            return h.response({ message: "Failed to create Doctor Token" }).code(404);
        }
        logger.info("Doctor " + name + " was Successfully created!", Helpers_1.RequestType.CREATE, credentials.name);
        return h.response({ message: "Doctor " + name + " was Successfully created!", }).code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to create Doctor " + name + "'s Account", Helpers_1.RequestType.CREATE, credentials.name, err.toString());
        return h
            .response({
            message: "Internal Server Error occurred, failed to create Doctor " +
                name +
                "'s Account",
        })
            .code(500);
    }
}
/** PATIENT Handlers */
async function createPatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { email, name, password } = request.payload;
    const credentials = request.auth.credentials;
    try {
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUnique", {
            where: {
                email: email,
                name: name,
            },
        });
        if (checkIfUserExist) {
            logger.error("Patient Account already exists!", Helpers_1.RequestType.READ, credentials.name);
            return h
                .response({ message: " Patient Account already exist!" })
                .code(400);
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const Patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "create", {
            data: {
                email: email,
                name: name,
                password: hashPassword,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        if (!Patient) {
            logger.error("Failed to create Patient", Helpers_1.RequestType.CREATE, credentials.name, Patient.toString());
        }
        const token = generateAuthToken(name, email, Helpers_1.TokenType.PATIENT, Patient.id);
        const expiration = (0, date_fns_1.add)(new Date(), {
            minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
        });
        const PatientToken = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "create", {
            type: Helpers_1.TokenType.PATIENT,
            valid: true,
            expiration: expiration,
            Token: token,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            patientId: Patient.id,
        });
        if (!PatientToken) {
            logger.error("Failed to create Patient Token", Helpers_1.RequestType.CREATE, credentials.name, PatientToken.toString());
            return h.response({ message: "Failed to create Patient Token" }).code(404);
        }
        logger.info(name + " was Successfully created!", Helpers_1.RequestType.CREATE, credentials.name);
        return h
            .response({ message: name + " was Successfully created!" })
            .code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to create" + name +
            "'s Account", Helpers_1.RequestType.CREATE, credentials.name, err.toString());
        return h
            .response({
            message: "Internal Server Error occurred, failed to create " +
                name +
                "'s Account",
        })
            .code(500);
    }
}
//# sourceMappingURL=userManagement.js.map