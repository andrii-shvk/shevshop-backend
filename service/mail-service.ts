import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import "dotenv/config";

class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        const options: SMTPTransport.Options = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        };

        this.transporter = nodemailer.createTransport(options);
    }

    async sendActivationMail(to: string, link: string) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: "Activation account on " + process.env.API_URL,
            text: "",
            html: `
                <div>
                    <h1>To activate your account click link</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
        });
    }
}

export default MailService;
