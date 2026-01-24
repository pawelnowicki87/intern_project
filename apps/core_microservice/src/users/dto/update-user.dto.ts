import { PartialType } from '@nestjs/mapped-types';
import { CreateUserWithPasswordDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserWithPasswordDto) {}
