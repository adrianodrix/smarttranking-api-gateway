import {
  ArgumentMetadata,
  Injectable,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { validate } from 'class-validator-multi-lang';
import { readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class ValidationBodyPipe extends ValidationPipe {
  private readonly logger = new Logger(ValidationBodyPipe.name);

  private PT_I18N_MESSAGES = JSON.parse(
    readFileSync(
      resolve(
        __dirname,
        '..',
        '..',
        'node_modules/class-validator-multi-lang/i18n/pt.json',
      ),
    ).toString(),
  );

  async transform(value: any, metadata: ArgumentMetadata) {
    this.logger.log(
      `value: ${JSON.stringify(value)} metadata: ${JSON.stringify(metadata)}`,
    );

    if (this.expectedType) {
      metadata = Object.assign(Object.assign({}, metadata), {
        metatype: this.expectedType,
      });
    }
    const metatype = metadata.metatype;
    if (!metatype || !this.toValidate(metadata)) {
      return this.isTransformEnabled
        ? this.transformPrimitive(value, metadata)
        : value;
    }
    const originalValue = value;
    value = this.toEmptyIfNil(value);
    const isNil = value !== originalValue;
    const isPrimitive = this.isPrimitive(value);
    this.stripProtoKeys(value);
    let entity = this.loadTransformer().plainToClass(
      metatype,
      value,
      this.transformOptions,
    );
    const originalEntity = entity;
    const isCtorNotEqual = entity.constructor !== metatype;
    if (isCtorNotEqual && !isPrimitive) {
      entity.constructor = metatype;
    } else if (isCtorNotEqual) {
      // when "entity" is a primitive value, we have to temporarily
      // replace the entity to perform the validation against the original
      // metatype defined inside the handler
      entity = { constructor: metatype };
    }
    const errors = await validate(entity, {
      messages: this.PT_I18N_MESSAGES,
      validationError: { target: false, value: false },
    });
    if (errors.length > 0) {
      throw await this.exceptionFactory(errors);
    }
    if (isPrimitive) {
      // if the value is a primitive value and the validation process has been successfully completed
      // we have to revert the original value passed through the pipe
      entity = originalEntity;
    }
    if (this.isTransformEnabled) {
      return entity;
    }
    if (isNil) {
      // if the value was originally undefined or null, revert it back
      return originalValue;
    }
    return Object.keys(this.validatorOptions).length > 0
      ? this.loadTransformer().classToPlain(entity, this.transformOptions)
      : value;
  }
}
