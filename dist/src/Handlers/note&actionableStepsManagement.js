"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// // Submit a note for a patient
// export async function createNoteHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
//   const { prisma, logger } = request.server.app;
//   const { doctorId, name } = request.auth.credentials;
//   const { patientId, content } = request.payload as { patientId: string; content: string };
//   try {
//     // Check if patient exists and is assigned to the doctor
//     const patient = await executePrismaMethod(prisma, "patient", "findFirst", {
//       where: {
//         id: patientId,
//         doctorId: doctorId
//       }
//     });
//     if (!patient) {
//       logger.error(`Patient not found or not assigned to doctor`, RequestType.READ, name);
//       return h.response({ message: "Patient not found or not assigned to you" }).code(404);
//     }
//     // Cancel previous actionable steps by marking them as completed
//     await cancelPreviousActionableSteps(prisma, patientId, doctorId);
//     // Create new note
//     const note = await executePrismaMethod(prisma, "note", "create", {
//       data: {
//         patientId,
//         doctorId,
//         content,
//         createdAt: getCurrentDate(),
//         updatedAt: getCurrentDate()
//       }
//     });
//     // Extract actionable steps using LLM
//     const actionableSteps = await extractActionableSteps(content, note.id);
//     // Create actionable steps in database
//     const createdSteps = await createActionableSteps(prisma, actionableSteps, note.id);
//     // Schedule reminders based on the plan steps
//     await scheduleReminders(prisma, createdSteps.filter(step => step.type === StepType.PLAN), patientId, doctorId);
//     logger.info(`Note created successfully for patient ${patientId}`, RequestType.CREATE, name);
//     return h.response({ 
//       message: "Note created successfully",
//       note,
//       actionableSteps: createdSteps
//     }).code(201);
//   } catch (err: any) {
//     logger.error(`Failed to create note: ${err.toString()}`, RequestType.CREATE, name);
//     return h.response({ message: "Failed to create note" }).code(500);
//   }
// }
// // Get patient's actionable steps (checklist and plan)
// export async function getActionableStepsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
//   const { prisma, logger } = request.server.app;
//   const { name } = request.auth.credentials;
//   const { patientId } = request.params;
//   try {
//     // Fetch the latest note for the patient
//     const latestNote = await executePrismaMethod(prisma, "note", "findFirst", {
//       where: {
//         patientId
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });
//     if (!latestNote) {
//       return h.response({ 
//         message: "No notes found for this patient",
//         checklist: [],
//         plan: []
//       }).code(200);
//     }
//     // Get actionable steps from the latest note
//     const actionableSteps = await executePrismaMethod(prisma, "actionableStep", "findMany", {
//       where: {
//         noteId: latestNote.id
//       }
//     });
//     // Separate into checklist and plan
//     const checklist = actionableSteps.filter(step => step.type === StepType.CHECKLIST);
//     const plan = actionableSteps.filter(step => step.type === StepType.PLAN);
//     logger.info(`Retrieved actionable steps for patient ${patientId}`, RequestType.READ, name);
//     return h.response({ 
//       noteId: latestNote.id,
//       checklist,
//       plan
//     }).code(200);
//   } catch (err: any) {
//     logger.error(`Failed to retrieve actionable steps: ${err.toString()}`, RequestType.READ, name);
//     return h.response({ message: "Failed to retrieve actionable steps" }).code(500);
//   }
// }
// // Patient check-in handler for reminders
// export async function patientCheckInHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
//   const { prisma, logger } = request.server.app;
//   const { patientId, name } = request.auth.credentials;
//   const { reminderId } = request.params;
//   try {
//     // Mark reminder as completed
//     const reminder = await executePrismaMethod(prisma, "reminder", "update", {
//       where: {
//         id: reminderId,
//         patientId
//       },
//       data: {
//         isCompleted: true
//       }
//     });
//     if (!reminder) {
//       logger.error(`Reminder not found`, RequestType.UPDATE, name);
//       return h.response({ message: "Reminder not found" }).code(404);
//     }
//     logger.info(`Patient checked in for reminder ${reminderId}`, RequestType.UPDATE, name);
//     return h.response({ 
//       message: "Check-in successful",
//       reminder
//     }).code(200);
//   } catch (err: any) {
//     logger.error(`Failed to check in: ${err.toString()}`, RequestType.UPDATE, name);
//     return h.response({ message: "Failed to check in" }).code(500);
//   }
// }
// // Helper function to cancel previous actionable steps when new note is created
// async function cancelPreviousActionableSteps(prisma: any, patientId: string, doctorId: string) {
//   // Get all previous notes for this patient
//   const previousNotes = await executePrismaMethod(prisma, "note", "findMany", {
//     where: {
//       patientId,
//       doctorId
//     },
//     select: {
//       id: true
//     }
//   });
//   const noteIds = previousNotes.map(note => note.id);
//   if (noteIds.length > 0) {
//     // Mark all actionable steps as completed
//     await executePrismaMethod(prisma, "actionableStep", "updateMany", {
//       where: {
//         noteId: {
//           in: noteIds
//         },
//         isCompleted: false
//       },
//       data: {
//         isCompleted: true
//       }
//     });
//     // Cancel all pending reminders
//     await executePrismaMethod(prisma, "reminder", "updateMany", {
//       where: {
//         patientId,
//         doctorId,
//         isCompleted: false
//       },
//       data: {
//         isCompleted: true
//       }
//     });
//   }
// }
// // LLM integration to extract actionable steps from note content
// async function extractActionableSteps(content: string, noteId: string): Promise<Array<{type: StepType, description: string, scheduledDate?: Date}>> {
//   // In a real implementation, this would call an LLM API like Google Gemini Flash
//   // For now, using a simulated extraction based on keywords
//   const steps: Array<{type: StepType, description: string, scheduledDate?: Date}> = [];
//   // Extract checklist items (one-time tasks)
//   if (content.toLowerCase().includes("medication")) {
//     steps.push({
//       type: StepType.CHECKLIST,
//       description: "Pick up medication from pharmacy"
//     });
//   }
//   if (content.toLowerCase().includes("blood")) {
//     steps.push({
//       type: StepType.CHECKLIST,
//       description: "Schedule blood test appointment"
//     });
//   }
//   // Extract plan items (scheduled actions)
//   if (content.toLowerCase().includes("daily") || content.toLowerCase().includes("every day")) {
//     // Create a daily reminder for 7 days
//     for (let i = 1; i <= 7; i++) {
//       const date = new Date();
//       date.setDate(date.getDate() + i);
//       steps.push({
//         type: StepType.PLAN,
//         description: "Take medication daily",
//         scheduledDate: date
//       });
//     }
//   }
//   // Default step if none extracted
//   if (steps.length === 0) {
//     steps.push({
//       type: StepType.CHECKLIST,
//       description: "Follow up with doctor in 2 weeks"
//     });
//   }
//   return steps;
// }
// // Create actionable steps in the database
// async function createActionableSteps(prisma: any, steps: Array<{type: StepType, description: string, scheduledDate?: Date}>, noteId: string) {
//   const createdSteps = [];
//   for (const step of steps) {
//     const newStep = await executePrismaMethod(prisma, "actionableStep", "create", {
//       data: {
//         type: step.type,
//         description: step.description,
//         scheduledDate: step.scheduledDate || new Date(),
//         noteId,
//         isCompleted: false
//       }
//     });
//     createdSteps.push(newStep);
//   }
//   return createdSteps;
// }
// // Schedule reminders based on plan steps
// async function scheduleReminders(prisma: any, planSteps: any[], patientId: string, doctorId: string) {
//   for (const step of planSteps) {
//     await executePrismaMethod(prisma, "reminder", "create", {
//       data: {
//         patientId,
//         doctorId,
//         message: step.description,
//         scheduledTime: step.scheduledDate,
//         isCompleted: false,
//         createdAt: getCurrentDate(),
//         updatedAt: getCurrentDate()
//       }
//     });
//   }
// }
// // Get all reminders for a patient
// export async function getRemindersHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
//   const { prisma, logger } = request.server.app;
//   const { patientId } = request.params;
//   const { name } = request.auth.credentials;
//   try {
//     const reminders = await executePrismaMethod(prisma, "reminder", "findMany", {
//       where: {
//         patientId,
//         scheduledTime: {
//           gte: new Date()
//         }
//       },
//       orderBy: {
//         scheduledTime: 'asc'
//       }
//     });
//     logger.info(`Retrieved reminders for patient ${patientId}`, RequestType.READ, name);
//     return h.response(reminders).code(200);
//   } catch (err: any) {
//     logger.error(`Failed to retrieve reminders: ${err.toString()}`, RequestType.READ, name);
//     return h.response({ message: "Failed to retrieve reminders" }).code(500);
//   }
// }
//# sourceMappingURL=note&actionableStepsManagement.js.map