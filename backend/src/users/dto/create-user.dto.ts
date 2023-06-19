import {IsEmail, IsNotEmpty, MaxLength} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @MaxLength(20)
    first_name: string;

    @IsNotEmpty()
    @MaxLength(20)
    last_name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    password: string;

    role_id: number;

}
