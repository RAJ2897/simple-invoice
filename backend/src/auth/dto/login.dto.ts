import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@simpleinvoice.dev' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  // class-validator runs decorators bottom-up; the "required" check goes last so it reports first
  @MaxLength(254)
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @MaxLength(128)
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
