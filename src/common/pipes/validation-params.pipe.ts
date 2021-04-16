import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ValidationParamsPipe implements PipeTransform {
  private readonly logger = new Logger(ValidationParamsPipe.name);

  constructor(private readonly i18n: I18nService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    this.logger.log(`value: ${value} metadata: ${JSON.stringify(metadata)}`);

    const { data } = metadata;

    if (!value) {
      throw new BadRequestException(
        await this.i18n.t('default.valueShouldNotBeEmpty', { args: { data } }),
      );
    }

    return value;
  }
}
