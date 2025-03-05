"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAccountCreationEmail = adminAccountCreationEmail;
const server_1 = __importDefault(require("../server"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function adminAccountCreationEmail(email, name, password) {
    try {
        const transporter = server_1.default.app.transporter;
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Account Creation",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background-color: #0055a5; color: white; padding: 15px; text-align: center; }
                    .content { padding: 20px; }
                    .password { background-color: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #0055a5; }
                    .footer { font-size: 11px; color: #666; padding: 10px; border-top: 1px solid #eee; }
                </style>
                </head>
                <body>
                <div class="container">
                    <div class="header">
                    <h2>Hospital Management System</h2>
                    </div>
                    <div class="content">
                    <p>Dear ${name},</p>
                    <p>Your account has been created successfully.</p>
                    <div class="password">
                        <p>Your password is: <strong>${password}</strong></p>
                    </div>
                    <p>Please login to the system and change your password at your earliest convenience.</p>
                    <p>Regards,<br>IT Department</p>
                    </div>
                    <div class="footer">
                    <p>CONFIDENTIAL: This email contains information intended for hospital system administrators only.</p>
                    </div>
                </div>
                </body>
                </html>
            `,
        };
        if (!email || !name || !password) {
            console.log("Missing credentials");
            return "Missing credentials";
        }
        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email sent: " + info.response);
            }
        });
        return "Email sent";
    }
    catch (e) {
        console.log(e);
        return "Error";
    }
}
//# sourceMappingURL=emailManagement.js.map