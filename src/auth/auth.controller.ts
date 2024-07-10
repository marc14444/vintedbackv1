import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { SignupDto } from './dto/signupDto';
import { signinDto } from './dto/signinDto';
import { AuthService } from './auth.service';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmationDto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DeleteAccountDto } from './dto/deleteAccountDto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    @Post("signup")
    signup(@Body() SignupDto: SignupDto){
        return this.authService.signup(SignupDto);
    }
    @Post("signin")
    signin(@Body() signinDto: signinDto){
        return this.authService.signin(signinDto);
    }
    signinDto(signinDto: any) {
        throw new Error('Method not implemented.');
    }
    @Post("reset-Password")
    resetPasswordDemand(@Body()resetPasswordDemandDto: ResetPasswordDemandDto){
        return this.authService.resetPasswordDemand(resetPasswordDemandDto);
    }
    @Post("reset-password-confirmation")
    resetPasswordConfirmation(@Body()resetPasswordConfirmationDto: ResetPasswordConfirmationDto){
        return this.authService.resetPasswordConfirmation(resetPasswordConfirmationDto);
    }@UseGuards(AuthGuard("jwt"))
    @Delete('delete')
    deleteAccount(@Req() request : Request, @Body() deleteAccountDto : DeleteAccountDto){
        const userId = request.user["userId"]
       return this.authService.deleteAccount(userId, deleteAccountDto);
    }
}
