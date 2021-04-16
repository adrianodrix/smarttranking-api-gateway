import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePlayerDTO {
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @Length(10, 80)
  name: string;

  @IsNotEmpty()
  @IsString()
  category: string;
}
