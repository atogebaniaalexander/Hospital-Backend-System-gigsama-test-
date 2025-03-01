"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.getLogsForDateRange = getLogsForDateRange;
exports.logsHandler = logsHandler;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const util_1 = require("util");
// Ensure the logs directory exists
const logDir = path.join(__dirname, 'logs');
fs_extra_1.default.ensureDirSync(logDir);
// Custom log format to match the required structure
const logFormat = winston.format.printf(({ message, requestType, detail, Requester }) => {
    return JSON.stringify({
        requestType,
        message,
        detail,
        Requester,
    });
});
const logConsoleFormat = winston.format.printf(({ level, message, detail, requestType, Requester }) => {
    let logMessage = `${requestType}-${level}: (${Requester}) ${message}`;
    if (detail) {
        logMessage += `\n>>>\n${detail}`;
    }
    return logMessage;
});
// Winston logger configuration
class Logger {
    constructor() {
        this.logger = winston.createLogger({
            level: "info",
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.combine(winston.format.timestamp(), logConsoleFormat)),
                }),
                new winston_daily_rotate_file_1.default({
                    filename: path.join(logDir, "logs-%DATE%.json"),
                    datePattern: "YYYY-MM-DD",
                    level: "info",
                    format: winston.format.combine(winston.format.timestamp(), logFormat),
                }),
            ],
        });
    }
    info(message, requestType, requester, detail) {
        this.logger.info(message, {
            requestType,
            message,
            detail,
            Requester: requester,
        });
    }
    error(message, requestType, requester, detail) {
        this.logger.error(message, {
            requestType,
            message,
            detail,
            Requester: requester,
        });
    }
    warn(message, requestType, requester, detail) {
        this.logger.warn(message, {
            requestType,
            message,
            detail,
            Requester: requester,
        });
    }
    debug(message, requestType, requester, detail) {
        this.logger.debug(message, {
            requestType,
            message,
            detail,
            Requester: requester,
        });
    }
}
exports.Logger = Logger;
// Promisify fs.readFile for async use
const readFile = (0, util_1.promisify)(fs_extra_1.default.readFile);
// Get logs from JSON files within a date range
async function getLogsForDateRange(startDate, endDate) {
    const logDir = path.join(__dirname, 'logs');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const logs = [];
    // Loop through the dates from start to end
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateString = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const filePath = path.join(logDir, `logs-${dateString}.json`);
        if (fs_extra_1.default.existsSync(filePath)) {
            const fileData = await readFile(filePath, 'utf-8');
            const jsonLogs = JSON.parse(fileData);
            logs.push(...jsonLogs); // Merge logs for the day
        }
    }
    return logs;
}
;
async function logsHandler(request, h) {
    const { startDate, endDate } = request.params;
    if (!startDate || !endDate) {
        return h.response({ message: "startDate and endDate are required" }).code(400);
    }
    try {
        const logs = await getLogsForDateRange(startDate, endDate);
        return h.response(logs).code(200);
    }
    catch (err) {
        console.error("Error fetching logs:", err);
        return h.response({ message: "Failed to fetch logs" }).code(500);
    }
}
//# sourceMappingURL=logger.js.map