import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { IPlayer } from 'src/players/interfaces/player.interface';

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsDateString()
  startAt: Date;

  @IsNotEmpty()
  applicant: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  players: string[];
}
