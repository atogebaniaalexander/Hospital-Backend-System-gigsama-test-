import * as winston from "winston";
import Hapi from "@hapi/hapi";
import * as path from "path";
import fs from "fs-extra";
import DailyRotateFile from "winston-daily-rotate-file";
import { promisify } from "util";
import { RequestType } from "../Helpers";
// Ensure the logs directory exists
const logDir = path.join(__dirname, 'logs');
fs.ensureDirSync(logDir);

// Custom log format to match the required structure
const logFormat = winston.format.printf(
  ({ message, requestType, detail, Requester }) => {
    return JSON.stringify({
      requestType,
      message,
      detail,
      Requester,
    });
  }
);
const logConsoleFormat = winston.format.printf(({ level, message, detail,requestType, Requester }) => {
  let logMessage = `${requestType}-${level}: (${Requester}) ${message}`;
  if (detail) {
    logMessage += `\n>>>\n${detail}`;
  }
  return logMessage;
});
// Winston logger configuration
export class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.combine(winston.format.timestamp(), logConsoleFormat)
          ),
        }),
        new DailyRotateFile({
          filename: path.join(logDir, "logs-%DATE%.json"),
          datePattern: "YYYY-MM-DD",
          level: "info",
          format: winston.format.combine(winston.format.timestamp(), logFormat),
        }),
      ],
    });
  }

 
  info(message: string, requestType: RequestType, requester: string, detail?: string) {
    this.logger.info(message, {
      requestType,
      message,
      detail,
      Requester: requester,
    });
  }

  error(message: string, requestType: RequestType, requester: string, detail?: string) {
    this.logger.error(message, {
      requestType,
      message,
      detail,
      Requester: requester,
    });
  }

  warn(message: string, requestType: RequestType, requester: string, detail?: string) {
    this.logger.warn(message, {
      requestType,
      message,
      detail,
      Requester: requester,
    });
  }

  debug(message: string, requestType: RequestType, requester: string, detail?: string) {
    this.logger.debug(message, {
      requestType,
      message,
      detail,
      Requester: requester,
    });
  }
}

// Promisify fs.readFile for async use
const readFile = promisify(fs.readFile);

// Get logs from JSON files within a date range
export async function getLogsForDateRange(startDate: string, endDate: string) {
  const logDir = path.join(__dirname, 'logs');
  const start = new Date(startDate);
  const end = new Date(endDate);
  const logs: any[] = [];

  // Loop through the dates from start to end
  for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
    const dateString = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const filePath = path.join(logDir, `logs-${dateString}.json`);

    if (fs.existsSync(filePath)) {
      const fileData = await readFile(filePath, 'utf-8');
      const jsonLogs = JSON.parse(fileData);
      logs.push(...jsonLogs); // Merge logs for the day
    }
  }

  return logs;
};
interface dataFormat{
  startDate: string,
  endDate: string,
}
export async function logsHandler(request: Hapi.Request,h: Hapi.ResponseToolkit){
  const { startDate, endDate } = request.params as dataFormat;

  if (!startDate || !endDate) {
      return h.response({message:"startDate and endDate are required"}).code(400);
  }

  try{
      const logs = await getLogsForDateRange(startDate, endDate);
      return h.response(logs).code(200);
  }catch(err){
    console.error("Error fetching logs:", err);
    return h.response({message:"Failed to fetch logs"}).code(500);
  }

}
