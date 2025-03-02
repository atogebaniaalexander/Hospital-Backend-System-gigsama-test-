"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDate = void 0;
exports.executePrismaMethod = executePrismaMethod;
const getCurrentDate = () => {
    //let getCurrentDate() use this format 2024-09-03
    //return new Date().toISOString().split("T")[0];
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
exports.getCurrentDate = getCurrentDate;
async function executePrismaMethod(prisma, entityName, methodName, options = {}) {
    return prisma[entityName][methodName](options);
}
//# sourceMappingURL=extras.js.map