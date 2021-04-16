import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IResult } from '../interfaces/result-interface';

export class AttachMatchChallengeDto {
  @IsNotEmpty()
  @IsString()
  def: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  result: IResult[];
}
