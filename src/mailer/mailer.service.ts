import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
@Injectable()
export class MailerService {
    private async transporter() {
        const testAccount = await nodemailer.createTestAccount();
        const transport = nodemailer.createTransport({
            host: 'localhost',
            port: 1025,
            ignoreTLS: true,
            auth: {
                user : testAccount.user,
                pass : testAccount.pass
            },
        });
        return transport;
    }
    async sendSignupConfirmation(userEmail: string){
        (await this.transporter()).sendMail({
            from: "vinted@localhost.com",
            to: userEmail,
            subject: "Votre inscription à Vinted",
            html: "Bonjour,<br><br>Vous avez effectué votre inscription à Vinted. Veuillez confirmer votre adresse email en cliquant sur le lien suivant : <a href='http://localhost:3000/confirm-email/${userEmail}'>Confirmer mon email</a>",
            text: "Merci de vous être inscrit à Vinted. Veuillez confirmer votre adresse email en cliquant sur le lien suivant : http://localhost:3000/confirm-email/${userEmail}"
        })
    }
    async sendResetPasswordEmail(userEmail: string, url: string, code: string){
        (await this.transporter()).sendMail({
        from : "vinted@localhost.com",
            to: userEmail,
            subject: "Réinitialiser votre mot de passe Vinted",
            html: `
            Bonjour,<br><br>Vous avez demandé à réinitialiser votre mot de passe. Veuillez cliquer sur le lien suivant : <a href='${url}'>Réinitialiser mon mot de passe</a>,
               $ <p> code secretest : 
                    ${code}
                </p>
               <p> votre code expiréras dans 10min
                    ${code}
                </p>
            `
        })
    }
}
