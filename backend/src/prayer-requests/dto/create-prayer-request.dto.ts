import {IsEmail, IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreatePrayerRequestDto {
    @IsNotEmpty()
    @ApiProperty({ example: 'Name' })
    name: string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ example: 'asd441@mailinator.com' })
    email: string;

    @IsNotEmpty()
    @ApiProperty({ example: '1234567890' })
    contact: string;

    @IsNotEmpty()
    @ApiProperty({ example: '01-01-2023' })
    start_date: string;

    @IsNotEmpty()
    @ApiProperty({ example: '01-01-2023' })
    end_date: string;

    @IsNotEmpty()
    @ApiProperty({ example: '22:15' })
    time: string;

    @IsNotEmpty()
    @ApiProperty({ example: 'This is the description for prayer request' })
    description: string;
}