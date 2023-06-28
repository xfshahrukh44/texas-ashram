import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Get,
    Request,
    UseGuards,
    UseInterceptors,
    UploadedFile, ParseFilePipe, MaxFileSizeValidator
} from '@nestjs/common';
import {AuthService} from "./auth.service";
import { AuthGuard } from './auth.guard';
import {SigninDto} from "./dto/signin.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";
import {
    deleteFileFromUploads,
    getRandomFileName,
    uploadFile
} from "../helpers/helper";
import {ForgotPasswordDto} from "./dto/forgot-password.dto";
import {SubmitOTPDto} from "./dto/submit-otp.dto";
import {UsersService} from "../users/users.service";
import {UpdateUserDto} from "../users/dto/update-user.dto";
import {ResetPasswordDto} from "./dto/reset-password.dto";
import { firebaseAdmin } from '../firebase/firebase-admin';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UsersService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDto: SigninDto) {
        let res = await this.authService.signIn(signInDto);

        return {
            success: !res.error,
            message: res.error ? res.error : 'Sign In successful!',
            data: res.error ? [] : res,
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signUp(@Body() signUpDto: CreateUserDto) {
        let res = await this.authService.signup(signUpDto);

        return {
            success: !res.error,
            message: res.error ? res.error : 'Sign Up successful!',
            data: res.error ? [] : res,
        }
    }

    @UseGuards(AuthGuard)
    @Get('me')
    @ApiBearerAuth()
    async me(@Request() req) {
        let user = await this.authService.getUserByEmail(req.user.email);

        return {
            success: !user.error,
            message: user.error ? user.error : '',
            data: user.error ? [] : user,
        }
    }

    @UseGuards(AuthGuard)
    @Post('upload-profile-picture')
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('profile_picture'))
    async uploadProfilePicture(@Request() req, @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({maxSize: 100000000})
            ]
        })
    ) profile_picture: Express.Multer.File) {

        let user = await this.authService.getUserByEmail(req.user.email);
        let app_url = process.env.APP_URL + ':' + process.env.PORT;
        if (user.error) {
            return {
                success: false,
                message: user.error,
                data: [],
            }
        }

        //delete if present and get file_path
        if (user.profile_picture != null) {
            let app_url = process.env.APP_URL + ':' + process.env.PORT;
            await deleteFileFromUploads(app_url, user.profile_picture);
        }

        let dir_path = '/uploads/users/';
        let file_name = getRandomFileName(profile_picture);
        let file_path = '.' + dir_path + file_name;

        await uploadFile('.' + dir_path, file_path, profile_picture);

        file_path = app_url + dir_path + file_name;

        let res = await this.authService.uploadProfilePicture(user.id, file_path);

        return {
            success: !res.error,
            message: res.error ? res.error : 'Profile picture updated successfully!',
            data: res.error ? [] : {profile_picture: file_path},
        }
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Post('update-profile')
    async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        let user = await this.authService.getUserByEmail(req.user.email);

        if (user.error) {
            return user;
        }

        let res = await this.authService.updateProfile(updateUserDto, user.id);

        return {
            success: !res.error,
            message: res.error ? res.error : 'Profile updated successfully!',
            data: res.error ? [] : res,
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        let res = await this.authService.forgotPassword(forgotPasswordDto);

        return {
            success: !res.error,
            message: res.error ? res.error : 'An OTP was sent to your email',
            data: res.error ? [] : res,
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('resend-otp')
    async resendOTP(@Body() forgotPasswordDto: ForgotPasswordDto) {
        let res = await this.authService.forgotPassword(forgotPasswordDto);

        return {
            success: !res.error,
            message: res.error ? res.error : 'An OTP was sent to your email',
            data: res.error ? [] : res,
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('submit-otp')
    async submitOTP(@Body() submitOTPDto: SubmitOTPDto) {
        let res = await this.authService.submitOTP(submitOTPDto);

        return {
            success: !res.error,
            message: res.error ? res.error : 'Your OTP was correct.',
            data: res.error ? [] : res,
        }
    }

    @UseGuards(AuthGuard)
    @Post('reset-password')
    @ApiBearerAuth()
    async resetPassword(@Request() req, @Body() resetPasswordDto: ResetPasswordDto) {
        let user = await this.authService.getUserByEmail(req.user.email);

        let updateUserDto = new UpdateUserDto();
        updateUserDto.password = resetPasswordDto.password

        let res = await this.userService.update(user.id, updateUserDto);

        return {
            success: !res.error,
            message: res.error ? res.error : 'Your password was reset',
            data: res.error ? [] : res,
        }
    }

    @Get('firebase/test')
    async firebaseTest() {
        const message = {
            notification: {
                title: 'Test Notification',
                body: 'Test Body',
            },
            topic: 'test', // The topic to which the notification will be sent
        };

        let response = await firebaseAdmin.messaging().send(message);

        console.log(response);

        return response;
    }
}
