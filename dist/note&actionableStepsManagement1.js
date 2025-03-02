"use strict";
// import axios from 'axios';
// // Interfaces
// interface PatientNote {
//   id?: string;
//   patientId: string;
//   doctorId: string;
//   content: string;
//   createdAt: Date;
//   updatedAt?: Date;
// }
// interface ActionableStep {
//   id?: string;
//   noteId: string;
//   description: string;
//   dueDate?: Date;
//   priority: 'low' | 'medium' | 'high';
//   status: 'pending' | 'completed' | 'cancelled';
//   createdAt: Date;
//   completedAt?: Date;
// }
// interface Reminder {
//   id?: string;
//   actionableStepId: string;
//   triggerTime: Date;
//   message: string;
//   recipientId: string;
//   status: 'pending' | 'sent' | 'cancelled';
// }
// // Service for handling notes and actionable steps
// export class NoteAndActionableStepsService {
//   private llmApiUrl: string;
//   private llmApiKey: string;
//   constructor(llmApiUrl: string, llmApiKey: string) {
//     this.llmApiUrl = llmApiUrl;
//     this.llmApiKey = llmApiKey;
//   }
//   // Submit a new patient note
//   async submitNote(noteData: Omit<PatientNote, 'id' | 'createdAt'>): Promise<PatientNote> {
//     try {
//       const note: PatientNote = {
//         ...noteData,
//         createdAt: new Date()
//       };
//       // Save note to database (placeholder - implement actual database call)
//       const savedNote = await this.saveNoteToDatabase(note);
//       // Extract actionable steps using LLM
//       const actionableSteps = await this.extractActionableSteps(savedNote);
//       // Schedule reminders for actionable steps
//       await this.scheduleReminders(actionableSteps);
//       return savedNote;
//     } catch (error) {
//       console.error('Error submitting note:', error);
//       throw new Error('Failed to submit note');
//     }
//   }
//   // Extract actionable steps from note using LLM
//   private async extractActionableSteps(note: PatientNote): Promise<ActionableStep[]> {
//     try {
//       const response = await axios.post(
//         this.llmApiUrl,
//         {
//           prompt: `Extract actionable medical steps from the following doctor's note: ${note.content}. 
//                   Format each step with: description, priority (low, medium, high), and suggested timeframe.`,
//           max_tokens: 500,
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${this.llmApiKey}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       const extractedText = response.data.choices[0].text;
//       return this.parseActionableSteps(extractedText, note.id!);
//     } catch (error) {
//       console.error('Error extracting actionable steps:', error);
//       throw new Error('Failed to extract actionable steps from note');
//     }
//   }
//   // Parse the LLM response into structured actionable steps
//   private parseActionableSteps(llmResponse: string, noteId: string): ActionableStep[] {
//     const steps: ActionableStep[] = [];
//     const stepRegex = /(?:Step|Task|Action)\s*\d*:?\s*([^\n]+)\s*Priority:?\s*(\w+)\s*Timeframe:?\s*([^\n]+)/gi;
//     let match;
//     while ((match = stepRegex.exec(llmResponse)) !== null) {
//       const description = match[1].trim();
//       const priority = this.normalizePriority(match[2].trim());
//       const timeframe = match[3].trim();
//       const dueDate = this.calculateDueDate(timeframe);
//       steps.push({
//         noteId,
//         description,
//         dueDate,
//         priority,
//         status: 'pending',
//         createdAt: new Date()
//       });
//     }
//     // Save steps to database (placeholder - implement actual database call)
//     return this.saveStepsToDatabase(steps);
//   }
//   // Schedule reminders based on actionable steps
//   private async scheduleReminders(steps: ActionableStep[]): Promise<void> {
//     for (const step of steps) {
//       if (step.dueDate) {
//         // Create reminder 1 day before due date
//         const reminderDate = new Date(step.dueDate);
//         reminderDate.setDate(reminderDate.getDate() - 1);
//         const reminder: Reminder = {
//           actionableStepId: step.id!,
//           triggerTime: reminderDate,
//           message: `Reminder: ${step.description} is due tomorrow`,
//           recipientId: this.getRecipientIdForStep(step),
//           status: 'pending'
//         };
//         // Save and schedule reminder (placeholder - implement actual scheduling)
//         await this.saveAndScheduleReminder(reminder);
//       }
//     }
//   }
//   // Helper methods
//   private normalizePriority(priority: string): 'low' | 'medium' | 'high' {
//     priority = priority.toLowerCase();
//     if (priority.includes('high') || priority.includes('urgent')) return 'high';
//     if (priority.includes('medium') || priority.includes('moderate')) return 'medium';
//     return 'low';
//   }
//   private calculateDueDate(timeframe: string): Date | undefined {
//     const now = new Date();
//     if (timeframe.match(/immediately|urgent|now|today/i)) {
//       return now;
//     }
//     const daysMatch = timeframe.match(/(\d+)\s*days?/i);
//     if (daysMatch) {
//       const days = parseInt(daysMatch[1]);
//       const dueDate = new Date(now);
//       dueDate.setDate(dueDate.getDate() + days);
//       return dueDate;
//     }
//     const weeksMatch = timeframe.match(/(\d+)\s*weeks?/i);
//     if (weeksMatch) {
//       const weeks = parseInt(weeksMatch[1]);
//       const dueDate = new Date(now);
//       dueDate.setDate(dueDate.getDate() + (weeks * 7));
//       return dueDate;
//     }
//     const monthsMatch = timeframe.match(/(\d+)\s*months?/i);
//     if (monthsMatch) {
//       const months = parseInt(monthsMatch[1]);
//       const dueDate = new Date(now);
//       dueDate.setMonth(dueDate.getMonth() + months);
//       return dueDate;
//     }
//     return undefined;
//   }
//   private getRecipientIdForStep(step: ActionableStep): string {
//     // Logic to determine who should receive the reminder
//     // This could be the doctor, patient, or other healthcare provider
//     // For now, return a placeholder value
//     return "doctor-id"; // Placeholder
//   }
//   // Database operation placeholders
//   private async saveNoteToDatabase(note: PatientNote): Promise<PatientNote> {
//     // Implement actual database operation
//     return { ...note, id: `note-${Date.now()}` };
//   }
//   private saveStepsToDatabase(steps: ActionableStep[]): ActionableStep[] {
//     // Implement actual database operation
//     return steps.map((step, index) => {
//       return { ...step, id: `step-${Date.now()}-${index}` };
//     });
//   }
//   private async saveAndScheduleReminder(reminder: Reminder): Promise<void> {
//     // Implement actual database operation and scheduling mechanism
//     // This might involve a task scheduler, message queue, etc.
//     console.log(`Scheduled reminder: ${reminder.message} at ${reminder.triggerTime}`);
//   }
//   // Handle updates to existing notes
//   async updateNote(noteId: string, updatedContent: string): Promise<PatientNote> {
//     try {
//       // Retrieve existing note
//       const existingNote = await this.getNoteById(noteId);
//       // Update note content and timestamp
//       const updatedNote: PatientNote = {
//         ...existingNote,
//         content: updatedContent,
//         updatedAt: new Date()
//       };
//       // Save updated note
//       const savedNote = await this.saveNoteToDatabase(updatedNote);
//       // Re-extract actionable steps
//       const newActionableSteps = await this.extractActionableSteps(savedNote);
//       // Cancel existing reminders
//       await this.cancelRemindersForNote(noteId);
//       // Schedule new reminders
//       await this.scheduleReminders(newActionableSteps);
//       return savedNote;
//     } catch (error) {
//       console.error('Error updating note:', error);
//       throw new Error('Failed to update note');
//     }
//   }
//   // Additional placeholder methods for completeness
//   private async getNoteById(noteId: string): Promise<PatientNote> {
//     // Implement actual database query
//     return {
//       id: noteId,
//       patientId: "patient-id",
//       doctorId: "doctor-id",
//       content: "Existing note content",
//       createdAt: new Date()
//     };
//   }
//   private async cancelRemindersForNote(noteId: string): Promise<void> {
//     // Implement cancellation of existing reminders
//     console.log(`Cancelled reminders for note: ${noteId}`);
//   }
// }
//# sourceMappingURL=note&actionableStepsManagement1.js.map