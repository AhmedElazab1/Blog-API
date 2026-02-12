import nodemailer from 'nodemailer';
import { IUser } from '../../models/types/types';
import env from '../../config/env';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class Email {
  private from: string;
  private firstName: string;

  constructor(
    private user: IUser,
    private url: string,
  ) {
    this.user = user;
    this.url = url;
    this.firstName = user.username.split(' ')[0];
    this.from = `ahmedelazab@admin.com`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      logger: true,
      tls: {
        rejectUnauthorized: true,
      },
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async send(subject: string, message: string) {
    const mailOptions = {
      from: this.from,
      to: this.user.email,
      subject,
      text: `Hi ${this.firstName},\n\n${message}\n\nBest regards,\nAhmed Elazab`,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // Example for welcome email
  async sendWelcome() {
    await this.send(
      'Welcome to Blog-API',
      `Thanks for joining! Visit your dashboard here: ${this.url}`,
    );
  }

  // Example for password reset email
  async sendPasswordReset() {
    await this.send(
      'Your password reset token (valid for 10 minutes)',
      `Here is your reset link: ${this.url}`,
    );
  }
}

export default Email;
