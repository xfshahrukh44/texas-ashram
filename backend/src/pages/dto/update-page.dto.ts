import {ApiProperty, PartialType} from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {
    @ApiProperty({ example: 'about' })
    name: string;

    @ApiProperty({ type: 'text' })
    content: string;
}
