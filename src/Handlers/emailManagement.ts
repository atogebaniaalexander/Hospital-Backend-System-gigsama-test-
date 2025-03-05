import Hapi from "@hapi/hapi";
import { transporter} from "../Plugins/email";
import dotenv from "dotenv";

dotenv.config();

export async function adminAccountCreationEmail(email: string, name: string, password: string): Promise<String> {
    try{
        
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
        if(!email || !name || !password){
            console.log("Missing credentials");
            return "Missing credentials";
        }
         await transporter.sendMail(mailOptions);

        return "Email sent";
    }catch(e){
        console.log(e);
        return "Error";
    }
  

 
}
// Function to send email to doctor after account creation
export async function doctorAccountCreationEmail(email: string, name: string, password: string): Promise<String> {
    try{
        
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
                    <p>Dear Dr. ${name},</p>
                    <p>Your account has been created successfully.</p>
                    <div class="password">
                        <p>Your password is: <strong>${password}</strong></p>
                    </div>
                    <p>Please login to the system and change your password at your earliest convenience.</p>
                    <p>Regards,<br>IT Department</p>
                    </div>
                </div>
                </body>
                </html>
            `,
        };
        if(!email || !name || !password){
            console.log("Missing credentials");
            return "Missing credentials";
        }
         await transporter.sendMail(mailOptions);

        return "Email sent";

    }catch(e){
        console.log(e);
        return "Error";
    }
}
// Function to send email to patient after account creation
export async function patientAccountCreationEmail(email: string, name: string, password: string): Promise<String> {
    try{
        
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
        if(!email || !name || !password){
            console.log("Missing credentials");
            return "Missing credentials";
        }
         await transporter.sendMail(mailOptions);

        return "Email sent";
    }catch(e){
        console.log(e);
        return "Error";
    }
}
// Function to send email to user after password reset
export async function passwordResetEmail(email: string, name: string): Promise<String> {
    try{
        const login = process.env.FRONTEND_URL + "/login";
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Password Reset",
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
                    <p>Your password has been reset successfully.</p>
                    <div class="login"> 
                        <p>Please login to the system using your new password</p>
                        <Link to={${login}}>Login</Link>
                    </div>
                    <p>Regards,<br>IT Department</p>
                    </div>
                </div>
                </body>
                </html>
            `,
        };
        if(!email || !name){
            console.log("Missing credentials");
            return "Missing credentials";
        }
         await transporter.sendMail(mailOptions);

        return "Email sent";
    }catch(e){
        console.log(e);
        return "Error";
    }
}
