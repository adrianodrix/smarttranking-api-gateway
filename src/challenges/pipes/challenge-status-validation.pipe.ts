import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { ChallengeStatus } from '../interfaces/challenge-status.enum';

@Injectable()
export class ChallengeStatusValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ChallengeStatusValidationPipe.name);
  private readonly statusAlowed = [
    ChallengeStatus.ACCEPT,
    ChallengeStatus.DENIED,
    ChallengeStatus.CANCELED,
  ];

  transform(value: { status: ChallengeStatus }, metadata: ArgumentMetadata) {
    this.logger.log(`value: ${value} metadata: ${JSON.stringify(metadata)}`);

    const status = value.status.toUpperCase();
    if (!this.isStatusValid(status)) {
      throw new BadRequestException(`${status} é um status inválido`);
    }
    return value;
  }

  private isStatusValid(status: any) {
    const idx = this.statusAlowed.indexOf(status);
    return idx != -1;
  }
}
