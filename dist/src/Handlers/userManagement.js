"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAuthToken = decodeAuthToken;
exports.getUserId = getUserId;
exports.resetPasswordHandler = resetPasswordHandler;
exports.createDoctorHandler = createDoctorHandler;
exports.listDoctorsHandler = listDoctorsHandler;
exports.updateDoctorHandler = updateDoctorHandler;
exports.deleteDoctorHandler = deleteDoctorHandler;
exports.getDoctorHandler = getDoctorHandler;
exports.createPatientHandler = createPatientHandler;
exports.listPatientHandler = listPatientHandler;
exports.updatePatientHandler = updatePatientHandler;
exports.deletePatientHandler = deletePatientHandler;
exports.getPatientHandler = getPatientHandler;
exports.loginHandler = loginHandler;
exports.logoutHandler = logoutHandler;
exports.assignDoctorToPatientHandler = assignDoctorToPatientHandler;
exports.getDoctorPatientsHandler = getDoctorPatientsHandler;
exports.getAvailableDoctorsHandler = getAvailableDoctorsHandler;
exports.adminAssignDoctorToPatientHandler = adminAssignDoctorToPatientHandler;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Helpers_1 = require("../Helpers");
const date_fns_1 = require("date-fns");
const emailManagement_1 = require("./emailManagement");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const AUTHENTICATION_TOKEN_EXPIRATION_MINUTES = 720;
function generateAuthToken(name, email, tokenType, userId, userType) {
    const jwtPayload = { name, email, tokenType, userId, userType };
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
//get user id
function getUserId(request, h) {
    const { userId, userType } = request.auth.credentials;
    return h.response({ id: userId, userType: userType }).code(200);
}
// reset password
async function resetPasswordHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { email, password } = request.payload;
    let isDoctor = false;
    let isPatient = false;
    let name = "User";
    try {
        const findDoctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", { where: { email: email } });
        if (!findDoctor) {
            logger.error("User is not a Doctor", Helpers_1.RequestType.READ, email);
        }
        else {
            isDoctor = true;
        }
        const findPatient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUnique", { where: { email: email } });
        if (!findPatient) {
            logger.error("User is not a Patient", Helpers_1.RequestType.READ, email);
        }
        else {
            isPatient = true;
        }
        if (isDoctor === true) {
            const hashPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "update", {
                where: {
                    email: email
                },
                data: {
                    password: hashPassword,
                    updatedAt: (0, Helpers_1.getCurrentDate)()
                }
            });
            if (!user) {
                logger.error("Failed to reset password", Helpers_1.RequestType.UPDATE, user.name);
                return h.response({ message: "Failed to reset password" }).code(404);
            }
            name = user.name;
            const sendMail = await (0, emailManagement_1.passwordResetEmail)(email, name);
            if (sendMail !== "Email sent") {
                logger.error("Failed to send Password Reset Email", Helpers_1.RequestType.UPDATE, user.name);
                await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "update", { where: { email: email }, data: { password: user.password } });
                return h.response({ message: "Failed to send Password Reset Email" }).code(404);
            }
            logger.info("Password reset Successfully", Helpers_1.RequestType.UPDATE, user.name);
        }
        else if (isPatient === true) {
            const hashPassword = await bcryptjs_1.default.hash(password, 10);
            const user = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "update", {
                where: {
                    email: email
                },
                data: {
                    password: hashPassword,
                    updatedAt: (0, Helpers_1.getCurrentDate)()
                }
            });
            if (!user) {
                logger.error("Failed to reset password", Helpers_1.RequestType.UPDATE, user.name);
                return h.response({ message: "Failed to reset password" }).code(404);
            }
            name = user.name;
            const sendMail = await (0, emailManagement_1.passwordResetEmail)(email, name);
            if (sendMail !== "Email sent") {
                logger.error("Failed to send Password Reset Email", Helpers_1.RequestType.UPDATE, user.name);
                await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "update", { where: { email: email }, data: { password: user.password } });
                return h.response({ message: "Failed to send Password Reset Email" }).code(404);
            }
            logger.info("Password reset Successfully", Helpers_1.RequestType.UPDATE, user.name);
        }
        else {
            logger.error("User not found", Helpers_1.RequestType.READ, email);
            return h.response({ message: "User not found" }).code(404);
        }
        return h.response({ message: "Password reset Successfully" }).code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to reset password", Helpers_1.RequestType.UPDATE, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to reset password" }).code(500);
    }
}
/** DOCTOR Handlers */
// create a doctor
async function createDoctorHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { email, name, password, specialty, available } = request.payload;
    const Requester = "New Doctor";
    try {
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", {
            where: {
                email: email,
            },
        });
        if (checkIfUserExist) {
            logger.error("Doctor Account already exists!", Helpers_1.RequestType.READ, Requester);
            return h.response({ message: " Doctor Account already exist!" }).code(400);
        }
        const hashPassword = await bcryptjs_1.default.hash(password, 10);
        const Doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "create", {
            data: {
                email: email,
                name: name,
                password: hashPassword,
                specialty: specialty || " ",
                available: available || false,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        if (!Doctor) {
            logger.error("Failed to create Doctor", Helpers_1.RequestType.CREATE, Requester, Doctor.toString());
        }
        const token = generateAuthToken(name, email, Helpers_1.TokenType.DOCTOR, Doctor.id, "doctor");
        const expiration = (0, date_fns_1.add)(new Date(), {
            minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
        });
        const DoctorToken = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "create", {
            data: {
                type: Helpers_1.TokenType.DOCTOR,
                valid: true,
                expiration: expiration,
                Token: token,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
                doctorId: Doctor.id,
            }
        });
        if (!DoctorToken) {
            logger.error("Failed to create Doctor Token", Helpers_1.RequestType.CREATE, Requester, DoctorToken.toString());
            return h.response({ message: "Failed to create Doctor Token" }).code(404);
        }
        const sendMail = await (0, emailManagement_1.doctorAccountCreationEmail)(email, name, password);
        if (sendMail !== "Email sent") {
            await (0, Helpers_1.executePrismaMethod)(prisma, "token", "delete", { where: { id: DoctorToken.id } });
            await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "delete", { where: { id: Doctor.id } });
            logger.error("Failed to send Account Creation Email", Helpers_1.RequestType.CREATE, Requester, sendMail.toString());
            return h.response({ message: "Failed to send Account Creation Email" }).code(404);
        }
        logger.info("Doctor " + name + " was Successfully created!", Helpers_1.RequestType.CREATE, Requester);
        return h.response({ message: "Doctor " + name + " was Successfully created!", }).code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to create Doctor " + name + "'s Account", Helpers_1.RequestType.CREATE, Requester, err.toString());
        return h
            .response({
            message: "Internal Server Error occurred, failed to create Doctor " +
                name +
                "'s Account",
        })
            .code(500);
    }
}
// list all doctors
async function listDoctorsHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { name } = request.auth.credentials;
    try {
        console.log("starting...");
        const doctors = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findMany", {
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
        if (!doctors) {
            logger.error("Failed to fetch Doctors", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Failed to fetch Doctors" }).code(404);
        }
        console.log("doctors available");
        let AllDoctors = [];
        for (const doctor of doctors) {
            let status = "Unavailable";
            let id = 1;
            if (doctor.available === true) {
                status = "Available";
            }
            const data = {
                id: id,
                doctorId: doctor.id,
                email: doctor.email,
                name: doctor.name,
                specialty: doctor.specialty,
                workStatus: status,
            };
            AllDoctors.push(data);
            id++;
        }
        logger.info("Doctors fetched Successfully", Helpers_1.RequestType.READ, name);
        return h.response(AllDoctors).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to fetch Doctors", Helpers_1.RequestType.READ, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to fetch Doctors" }).code(500);
    }
}
// update a doctor
async function updateDoctorHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { doctorId } = request.params;
    const { name, email, specialty, available } = request.payload;
    const credentials = request.auth.credentials;
    try {
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findFirst", {
            where: {
                id: doctorId,
                email: email,
            }
        });
        if (!checkIfUserExist) {
            logger.error("Doctor not found", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Doctor not found" }).code(404);
        }
        const Doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "update", {
            where: {
                id: checkIfUserExist.id,
            },
            data: {
                name: name || checkIfUserExist.name,
                specialty: specialty || checkIfUserExist.specialty,
                available: available || checkIfUserExist.available,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            }
        });
        if (!Doctor) {
            logger.error("Failed to update Doctor", Helpers_1.RequestType.UPDATE, credentials.name);
            return h.response({ message: "Failed to update Doctor" }).code(404);
        }
        logger.info("Doctor updated Successfully", Helpers_1.RequestType.UPDATE, credentials.name);
        return h.response({ message: "Doctor updated Successfully" }).code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to update Doctor", Helpers_1.RequestType.UPDATE, credentials.name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to update Doctor" }).code(500);
    }
}
// delete a doctor
async function deleteDoctorHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { doctorId } = request.params;
    const { name } = request.auth.credentials;
    try {
        const token = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "delete", {
            where: {
                type: Helpers_1.TokenType.DOCTOR,
                patientId: doctorId
            }
        });
        if (!token) {
            logger.error("Failed to delete token", Helpers_1.RequestType.DELETE, name);
            return h.response({ message: "Failed to delete token" }).code(404);
        }
        const Doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "delete", {
            where: {
                id: doctorId
            }
        });
        if (!Doctor) {
            logger.error("Failed to delete Doctor", Helpers_1.RequestType.DELETE, name);
            return h.response({ message: "Failed to delete Doctor" }).code(404);
        }
        logger.info("Doctor deleted Successfully", Helpers_1.RequestType.DELETE, name);
        return h.response({ message: "Doctor deleted Successfully" }).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to delete Doctor", Helpers_1.RequestType.DELETE, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to delete Doctor" }).code(500);
    }
}
// get a doctor
async function getDoctorHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { doctorId } = request.params;
    const { name } = request.auth.credentials;
    try {
        const doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", {
            where: {
                id: doctorId
            }
        });
        if (!doctor) {
            logger.error("Failed to fetch Doctor", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Failed to fetch Doctor" }).code(404);
        }
        const data = {
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            specialty: doctor.specialty,
            available: doctor.available,
            createdAt: doctor.createdAt,
            updateAt: doctor.updateAt,
        };
        logger.info("Doctor fetched Successfully", Helpers_1.RequestType.READ, name);
        return h.response(data).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to fetch Doctor", Helpers_1.RequestType.READ, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to fetch Doctor" }).code(500);
    }
}
/** PATIENT Handlers */
// create a patient
async function createPatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { email, name, password } = request.payload;
    const Requester = "New Patient";
    try {
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUnique", {
            where: {
                email: email,
            },
        });
        if (checkIfUserExist) {
            logger.error("Patient Account already exists!", Helpers_1.RequestType.READ, Requester);
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
            logger.error("Failed to create Patient", Helpers_1.RequestType.CREATE, Requester, Patient.toString());
        }
        const token = generateAuthToken(name, email, Helpers_1.TokenType.PATIENT, Patient.id, "patient");
        const expiration = (0, date_fns_1.add)(new Date(), {
            minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
        });
        const PatientToken = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "create", {
            data: {
                type: Helpers_1.TokenType.PATIENT,
                valid: true,
                expiration: expiration,
                Token: token,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
                patientId: Patient.id,
            }
        });
        if (!PatientToken) {
            logger.error("Failed to create Patient Token", Helpers_1.RequestType.CREATE, Requester, PatientToken.toString());
            return h.response({ message: "Failed to create Patient Token" }).code(404);
        }
        const sendMail = await (0, emailManagement_1.patientAccountCreationEmail)(email, name, password);
        if (sendMail !== "Email sent") {
            await (0, Helpers_1.executePrismaMethod)(prisma, "token", "delete", { where: { id: PatientToken.id } });
            await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "delete", { where: { id: Patient.id } });
            logger.error("Failed to send Account Creation Email", Helpers_1.RequestType.CREATE, Requester, sendMail.toString());
            return h.response({ message: "Failed to send Account Creation Email" }).code(404);
        }
        logger.info(name + " was Successfully created!", Helpers_1.RequestType.CREATE, Requester);
        return h
            .response({ message: name + " was Successfully created!" })
            .code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to create" + name +
            "'s Account", Helpers_1.RequestType.CREATE, Requester, err.toString());
        return h
            .response({
            message: "Internal Server Error occurred, failed to create " +
                name +
                "'s Account",
        })
            .code(500);
    }
}
// list all patients
async function listPatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { name, userId, userType } = request.auth.credentials;
    let adminId = 0;
    if (userType === "admin") {
        adminId = userId;
    }
    try {
        const patients = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findMany", {
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updateAt: true,
            }
        });
        if (!patients) {
            logger.error("Failed to fetch Patients", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Failed to fetch Patients" }).code(404);
        }
        let AllPatients = [];
        if (adminId) {
            for (const patient of patients) {
                let id = 1;
                const data = {
                    id: id,
                    patientId: patient.id,
                    name: patient.name,
                    email: patient.email,
                    createdAt: patient.createdAt,
                    updateAt: patient.updateAt,
                };
                AllPatients.push(data);
                id++;
            }
        }
        else {
            for (const patient of patients) {
                let id = 1;
                const data = {
                    id: id,
                    patientId: patient.id,
                    name: patient.name,
                    email: patient.email,
                };
                AllPatients.push(data);
                id++;
            }
        }
        logger.info("Patients fetched Successfully", Helpers_1.RequestType.READ, name);
        return h.response(AllPatients).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to fetch Patients", Helpers_1.RequestType.READ, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to fetch Patients" }).code(500);
    }
}
// update a patient
async function updatePatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { patientId } = request.params;
    const { name, email } = request.payload;
    const credentials = request.auth.credentials;
    try {
        const checkIfUserExist = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findFirst", {
            where: {
                id: patientId,
                email: email,
            }
        });
        if (!checkIfUserExist) {
            logger.error("Patient not found", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Patient not found" }).code(404);
        }
        const Patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "update", {
            where: {
                id: checkIfUserExist.id,
            },
            data: {
                name: name || checkIfUserExist.name,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            }
        });
        if (!Patient) {
            logger.error("Failed to update Patient", Helpers_1.RequestType.UPDATE, credentials.name);
            return h.response({ message: "Failed to update Patient" }).code(404);
        }
        logger.info("Patient updated Successfully", Helpers_1.RequestType.UPDATE, credentials.name);
        return h.response({ message: "Patient updated Successfully" }).code(201);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to update Patient", Helpers_1.RequestType.UPDATE, credentials.name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to update Patient" }).code(500);
    }
}
// update a patient
async function deletePatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { patientId } = request.params;
    const { name } = request.auth.credentials;
    try {
        const token = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "delete", {
            where: {
                type: Helpers_1.TokenType.PATIENT,
                patientId: patientId
            }
        });
        if (!token) {
            logger.error("Failed to delete token", Helpers_1.RequestType.DELETE, name);
            return h.response({ message: "Failed to delete token" }).code(404);
        }
        const Patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "delete", {
            where: {
                id: patientId
            }
        });
        if (!Patient) {
            logger.error("Failed to delete Patient", Helpers_1.RequestType.DELETE, name);
            return h.response({ message: "Failed to delete Patient" }).code(404);
        }
        logger.info("Patient deleted Successfully", Helpers_1.RequestType.DELETE, name);
        return h.response({ message: "Patient deleted Successfully" }).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to delete Patient", Helpers_1.RequestType.DELETE, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to delete Patient" }).code(500);
    }
}
// get a patient
async function getPatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { patientId } = request.params;
    const { name } = request.auth.credentials;
    try {
        const patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUnique", {
            where: {
                id: patientId
            }
        });
        if (!patient) {
            logger.error("Failed to fetch Patient", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Failed to fetch Patient" }).code(404);
        }
        const data = {
            id: patient.id,
            patientId: patient.id,
            name: patient.name,
            email: patient.email,
            createdAt: patient.createdAt,
            updateAt: patient.updateAt,
        };
        logger.info("Patient fetched Successfully", Helpers_1.RequestType.READ, name);
        return h.response(data).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to fetch Patient", Helpers_1.RequestType.READ, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to fetch Patient" }).code(500);
    }
}
/** General  */
//login payload
var Role;
(function (Role) {
    Role["DOCTOR"] = "doctor";
    Role["PATIENT"] = "patient";
    Role["ADMIN"] = "admin";
})(Role || (Role = {}));
async function loginHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { email, password, role } = request.payload;
    let userType = "";
    try {
        let user;
        if (role === Role.DOCTOR) {
            userType = Role.DOCTOR;
            user = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", {
                where: {
                    email: email,
                },
            });
        }
        else if (role === Role.PATIENT) {
            userType = Role.PATIENT;
            user = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUnique", {
                where: {
                    email: email,
                },
            });
        }
        else if (role === Role.ADMIN) {
            userType = Role.ADMIN;
            user = await (0, Helpers_1.executePrismaMethod)(prisma, "admin", "findUnique", {
                where: {
                    email: email,
                },
            });
        }
        else {
            logger.error("Invalid Role", Helpers_1.RequestType.READ, email);
            return h.response({ message: "Invalid Role" }).code(400);
        }
        if (!user) {
            logger.error("User not found", Helpers_1.RequestType.READ, email);
            return h.response({ message: "User not found" }).code(404);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            logger.error("Invalid Password", Helpers_1.RequestType.READ, email);
            return h.response({ message: "Invalid Password" }).code(401);
        }
        const findToken = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
            where: {
                type: role.toUpperCase(),
                [role.toUpperCase() === Helpers_1.TokenType.DOCTOR ? "doctorId" : role.toUpperCase() === Helpers_1.TokenType.PATIENT ? "patientId" : "adminId"]: user.id,
            },
        });
        const token = generateAuthToken(user.name, email, findToken.type, user.id, userType);
        const expiration = (0, date_fns_1.add)(new Date(), {
            minutes: AUTHENTICATION_TOKEN_EXPIRATION_MINUTES,
        });
        const Token = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "update", {
            where: {
                type: role.toUpperCase(),
                [role.toUpperCase() === Helpers_1.TokenType.DOCTOR ? "doctorId" : role.toUpperCase() === Helpers_1.TokenType.PATIENT ? "patientId" : "adminId"]: user.id,
            },
            data: {
                valid: true,
                expiration: expiration,
                Token: token,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        if (!Token) {
            logger.error("Failed to create Token", Helpers_1.RequestType.CREATE, email, Token.toString());
            return h.response({ message: "Failed to create Token" }).code(404);
        }
        logger.info("User logged in successfully", Helpers_1.RequestType.READ, email);
        return h.response({ token }).header('Authorization', `Bearer ${token}`).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to login", Helpers_1.RequestType.READ, email, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to login" }).code(500);
    }
}
async function logoutHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { tokenId, name } = request.auth.credentials;
    try {
        const checkIfTokenExist = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "findUnique", {
            where: {
                id: tokenId,
            },
        });
        console.log("token is vallid: ", checkIfTokenExist);
        if (!checkIfTokenExist) {
            logger.error("Token not found", Helpers_1.RequestType.READ, name);
            return h.response({ message: "Token not found" }).code(404);
        }
        const Token = await (0, Helpers_1.executePrismaMethod)(prisma, "token", "update", {
            where: {
                id: tokenId,
            },
            data: {
                valid: false,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        console.log("Token updated", Token);
        if (!Token) {
            logger.error("Failed to logout", Helpers_1.RequestType.UPDATE, name);
            return h.response({ message: "Failed to logout" }).code(404);
        }
        logger.info("User logged out successfully", Helpers_1.RequestType.UPDATE, name);
        return h.response({ message: "User logged out successfully" }).code(200);
    }
    catch (err) {
        logger.error("Internal Server Error occurred, failed to logout", Helpers_1.RequestType.UPDATE, name, err.toString());
        return h.response({ message: "Internal Server Error occurred, failed to logout" }).code(500);
    }
}
/** Patient-Doctor Assignment */
// Assign doctor to patient
async function assignDoctorToPatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { doctorId } = request.payload;
    const { userId, userType, name } = request.auth.credentials;
    let patientId = 0;
    if (userType === "patient") {
        patientId = userId;
    }
    try {
        // Check if doctor exists
        const doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", {
            where: {
                id: doctorId
            }
        });
        if (!doctor) {
            logger.error(`Doctor not found with id ${doctorId}`, Helpers_1.RequestType.READ, name);
            return h.response({ message: "Doctor not found" }).code(404);
        }
        // Update patient with selected doctor
        const patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "update", {
            where: {
                id: patientId
            },
            data: {
                doctorId: doctorId,
                updatedAt: (0, Helpers_1.getCurrentDate)()
            }
        });
        if (!patient) {
            logger.error(`Failed to assign doctor to patient ${patientId}`, Helpers_1.RequestType.UPDATE, name);
            return h.response({ message: "Failed to assign doctor" }).code(500);
        }
        logger.info(`Doctor ${doctorId} assigned to patient ${patientId} successfully`, Helpers_1.RequestType.UPDATE, name);
        return h.response({ message: "Doctor assigned successfully" }).code(200);
    }
    catch (err) {
        logger.error(`Internal Server Error occurred, failed to assign doctor: ${err.toString()}`, Helpers_1.RequestType.UPDATE, name);
        return h.response({ message: "Internal Server Error occurred, failed to assign doctor" }).code(500);
    }
}
// Get all patients assigned to a doctor
async function getDoctorPatientsHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const doctorId = request.params.doctorId;
    const { name } = request.auth.credentials;
    try {
        const patients = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findMany", {
            where: {
                doctorId: doctorId
            },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
        let AllPatients = [];
        for (const patient of patients) {
            let id = 1;
            const data = {
                id: id,
                patientId: patient.id,
                email: patient.email,
                name: patient.name
            };
            AllPatients.push(data);
            id++;
        }
        logger.info(`Retrieved ${patients.length} patients for doctor ${doctorId}`, Helpers_1.RequestType.READ, name);
        return h.response(AllPatients).code(200);
    }
    catch (err) {
        logger.error(`Internal Server Error occurred, failed to retrieve doctor's patients: ${err.toString()}`, Helpers_1.RequestType.READ, name);
        return h.response({ message: "Internal Server Error occurred, failed to retrieve patients" }).code(500);
    }
}
// Get all available doctors (for patient selection)
async function getAvailableDoctorsHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { name } = request.auth.credentials;
    try {
        const doctors = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findMany", {
            where: {
                available: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                specialty: true
            }
        });
        let AllDoctors = [];
        for (const doctor of doctors) {
            let id = 1;
            const data = {
                id: id,
                doctorId: doctor.id,
                email: doctor.email,
                name: doctor.name,
                specialty: doctor.specialty,
            };
            AllDoctors.push(data);
            id++;
        }
        logger.info(`Retrieved ${doctors.length} available doctors`, Helpers_1.RequestType.READ, name);
        return h.response(AllDoctors).code(200);
    }
    catch (err) {
        logger.error(`Internal Server Error occurred, failed to retrieve available doctors: ${err.toString()}`, Helpers_1.RequestType.READ, name);
        return h.response({ message: "Internal Server Error occurred, failed to retrieve doctors" }).code(500);
    }
}
// admin assign patient to doctor
async function adminAssignDoctorToPatientHandler(request, h) {
    const { prisma, logger } = request.server.app;
    const { doctorId, patientId } = request.payload;
    const { name } = request.auth.credentials;
    try {
        // Check if doctor exists
        const doctor = await (0, Helpers_1.executePrismaMethod)(prisma, "doctor", "findUnique", {
            where: {
                id: doctorId
            }
        });
        if (!doctor) {
            logger.error(`Doctor not found with id ${doctorId}`, Helpers_1.RequestType.READ, name);
            return h.response({ message: "Doctor not found" }).code(404);
        }
        // Check if patient exists
        const patientExists = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "findUnique", {
            where: {
                id: patientId
            }
        });
        if (!patientExists) {
            logger.error(`Patient not found with id ${patientId}`, Helpers_1.RequestType.READ, name);
            return h.response({ message: "Patient not found" }).code(404);
        }
        // Update patient with selected doctor
        const patient = await (0, Helpers_1.executePrismaMethod)(prisma, "patient", "update", {
            where: {
                id: patientId
            },
            data: {
                doctorId: doctorId,
                updatedAt: (0, Helpers_1.getCurrentDate)()
            }
        });
        if (!patient) {
            logger.error(`Failed to assign doctor to patient ${patientId}`, Helpers_1.RequestType.UPDATE, name);
            return h.response({ message: "Failed to assign doctor" }).code(500);
        }
        logger.info(`Admin ${name} assigned doctor ${doctorId} to patient ${patientId}`, Helpers_1.RequestType.UPDATE, name);
        return h.response({
            message: "Doctor assigned successfully",
            patient: {
                id: patient.id,
                name: patient.name,
                doctorId: patient.doctorId
            }
        }).code(200);
    }
    catch (err) {
        logger.error(`Internal Server Error occurred, failed to assign doctor: ${err.toString()}`, Helpers_1.RequestType.UPDATE, name);
        return h.response({ message: "Internal Server Error occurred, failed to assign doctor" }).code(500);
    }
}
//# sourceMappingURL=userManagement.js.map