"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = exports.RequestType = exports.LogType = exports.StepType = void 0;
var StepType;
(function (StepType) {
    StepType["CHECKLIST"] = "CHECKLIST";
    StepType["PLAN"] = "CHECKLIST";
})(StepType || (exports.StepType = StepType = {}));
var LogType;
(function (LogType) {
    LogType["INFO"] = "INFO";
    LogType["WARNING"] = "WARNING";
    LogType["ERROR"] = "ERROR";
})(LogType || (exports.LogType = LogType = {}));
var RequestType;
(function (RequestType) {
    RequestType["CREATE"] = "CREATE";
    RequestType["UPDATE"] = "UPDATE";
    RequestType["DELETE"] = "DELETE";
    RequestType["READ"] = "READ";
})(RequestType || (exports.RequestType = RequestType = {}));
var TokenType;
(function (TokenType) {
    TokenType["DOCTOR"] = "DOCTOR";
    TokenType["PATIENT"] = "PATIENT";
    TokenType["ADMIN"] = "ADMIN";
})(TokenType || (exports.TokenType = TokenType = {}));
//# sourceMappingURL=types.js.map