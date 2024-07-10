import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signupDto';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import { MailerService } from 'src/mailer/mailer.service';
import { JwtService } from '@nestjs/jwt';
import { signinDto } from './dto/signinDto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto';
import * as speakeasy from 'speakeasy';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmationDto';
import { DeleteAccountDto } from './dto/deleteAccountDto';

@Injectable()
export class AuthService {
    deleteAccount(userId: any, deleteAccountDto: DeleteAccountDto) {
        throw new Error('Method not implemented.');
    }

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService, 
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    //* Destructure le signup dto et récupérer l'email, le mot de passe et le nom de l'utilisateur */
    const { email, password, username } = signupDto;

    //* Vérifier si l'utilisateur est déjà inscrit */
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (user) throw new ConflictException(`L'utilisateur existe déjà`);

    //* Hasher le mot de passe */
    const hash = await bcrypt.hash(password, 10);

    //* Enregistrer l'utilisateur dans la base de données */
    await this.prismaService.user.create({ data: { email, password: hash, username } });

    //* Envoyer un mail de confirmation */
    await this.mailerService.sendSignupConfirmation(email);

    //* Retourner un message de succès */
    return { data: `L'utilisateur ${username} a été créé avec succès` };
  }
    async signin (signinDto: signinDto) {
        const {email,password} = signinDto
        //**verifier que l'utilisateur est inscrire
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if(!user) throw new NotFoundException(`L'utilisateur n'existe pas`);
        //*comparer le mot de passe du user avec le hash*/
        const match = await bcrypt.compare(password, user.password);
        if(!match) throw new UnauthorizedException(`Le mot de passe est incorrect`);
        //**retourner un token jwt*/
        const payload = {
            sub: user.userId,
            email: user.email,
        };
        const token = this.jwtService.sign(payload,{
            secret: this.configService.get('SECREAT_KEY'),
            expiresIn: '2h',
        });
        return{
            token,
            user:{
                username: user.username,
                email: user.email
            }
        }
        

    }

    async resetPasswordDemand(resetPasswordDemandDto: ResetPasswordDemandDto){
        const {email} = resetPasswordDemandDto;
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if(!user) throw new NotFoundException(`L'utilisateur n'existe pas`);
        const code = speakeasy.totp({
                secret : this.configService.get("OTP_CODE"),
                digits:5,
                step: 60*15,
                encoding: 'base32',
        })
        const url = "https://lochotest:3000/auth/reset-password-confirm?token="+code+"&email="+email;
        await this.mailerService.sendResetPasswordEmail(email,url,code);
        return {data: `Un lien de réinitialisation de mot de passe a été envoyé à ${email}`};
    }
    async resetPasswordConfirmation(resetPasswordConfirmationDto: ResetPasswordConfirmationDto) {
        const {code,email,password} = resetPasswordConfirmationDto;
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if(!user) throw new NotFoundException(`L'utilisateur n'existe pas`);
            const match = await speakeasy.totp.verify({
            secret : this.configService.get("OTP_CODE"),
            encoding: 'base32',
            token: code,
            digits: 5,
            step: 60*15,
        });
        if(!match) throw new UnauthorizedException(`Le code est incorrect ou token expiré`); 
        const hash = await bcrypt.hash(password, 10);
        await this.prismaService.user.update({where: {email},data:{password:hash}});
        return {data: `Votre mot de passe a été réinitialisé avec succès`};

        async deleteAccount(userId: number, deleteAccountDto: DeleteAccountDto) {
            
        }
    }
}
