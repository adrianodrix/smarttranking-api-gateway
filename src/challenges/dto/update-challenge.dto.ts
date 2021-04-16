import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsString } from 'class-validator';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';
import { CreateChallengeDto } from './create-challenge.dto';

export class UpdateChallengeDto extends PartialType(CreateChallengeDto) {
  @IsDateString()
  startAt: Date;

  @IsString()
  status: ChallengeStatus;
}
