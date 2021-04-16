import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { CreatePlayerDTO } from './dto/create-player.dto';
import { UpdatePlayerDTO } from './dto/update-player.dto';
import { IdValidationParamsPipe } from '../common/pipes/id-validation-params.pipe';
import { ValidationParamsPipe } from 'src/common/pipes/validation-params.pipe';
import { ClientProxy } from '@nestjs/microservices';
import { ClientProxySmartRanking } from 'src/proxymq/client-proxy';
import { PlayerEvents } from './interfaces/player-events.enum';
import { Observable } from 'rxjs';
import { CategoryEvents } from 'src/categories/interfaces/category-events.enum';
import { I18nService } from 'nestjs-i18n';
import { isValidObjectId } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { AWSService } from 'src/aws/aws.service';

@Controller('api/v1/players')
export class PlayersController {
  constructor(
    private readonly clientProxySmartRanking: ClientProxySmartRanking,
    private readonly aws: AWSService,
    private readonly _t: I18nService,
  ) {}

  private readonly logger = new Logger(PlayersController.name);
  private readonly clientAdminBackend: ClientProxy = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post()
  async create(@Body() createPlayerDTO: CreatePlayerDTO): Promise<void> {
    this.logger.log(`create: ${JSON.stringify(createPlayerDTO)}`);
    const { category } = createPlayerDTO;

    if (category) {
      if (!isValidObjectId(category)) {
        throw new BadRequestException(await this._t.t('default.idIsInvalid'));
      }

      const categoryFound = await this.clientAdminBackend
        .send(CategoryEvents.FIND, category)
        .toPromise();

      if (!categoryFound) {
        throw new BadRequestException(
          await this._t.t('categories.notFound', {
            args: { category },
          }),
        );
      }
    }

    this.clientAdminBackend.emit(PlayerEvents.CREATE, createPlayerDTO);
  }

  @Patch(':id')
  async update(
    @Param('id', IdValidationParamsPipe) id: string,
    @Body() updatePlayerDTO: UpdatePlayerDTO,
  ): Promise<void> {
    this.logger.log(`update: ${id}, ${JSON.stringify(updatePlayerDTO)}`);

    const { category } = updatePlayerDTO;

    if (category) {
      if (!isValidObjectId(category)) {
        throw new BadRequestException(await this._t.t('default.idIsInvalid'));
      }

      const categoryFound = await this.clientAdminBackend
        .send(CategoryEvents.FIND, category)
        .toPromise();

      if (!categoryFound) {
        throw new BadRequestException(
          await this._t.t('categories.notFound', {
            args: { category },
          }),
        );
      }
    }

    this.clientAdminBackend.emit(PlayerEvents.UPDATE, {
      id,
      updatePlayerDTO,
    });
  }

  @Delete(':id')
  delete(@Param('id', IdValidationParamsPipe) id: string): void {
    this.logger.log(`delete: ${id}`);
    this.clientAdminBackend.emit(PlayerEvents.DELETE, id);
  }

  @Get()
  findAll(): Observable<any> {
    return this.clientAdminBackend.send(PlayerEvents.FIND, '');
  }

  @Get('email/:email')
  findByEmail(
    @Param('email', ValidationParamsPipe) email: string,
  ): Observable<any> {
    this.logger.log(`findByEmail: ${email}`);
    return this.clientAdminBackend.send(PlayerEvents.FIND, { email });
  }

  @Get(':id')
  findById(@Param('id', IdValidationParamsPipe) id: string): Observable<any> {
    this.logger.log(`findById: ${id}`);
    return this.clientAdminBackend.send(PlayerEvents.FIND, { id });
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile('file') file: Express.Multer.File,
    @Param('id', IdValidationParamsPipe) id: string,
  ): Promise<void> {
    this.logger.log(`avatar: ${id}`);

    if (!file) {
      throw new BadRequestException(
        await this._t.t('default.valueShouldNotBeEmpty', {
          args: { data: 'file' },
        }),
      );
    }
    const playerFound = await this.clientAdminBackend
      .send(PlayerEvents.FIND, { id })
      .toPromise();
    if (!playerFound) {
      throw new BadRequestException(
        await this._t.t('players.notFound', {
          args: { player: id },
        }),
      );
    }

    const { url: urlAvatar } = await this.aws.uploadAvatar(file, id);
    this.clientAdminBackend.emit(PlayerEvents.UPDATE, {
      id,
      updatePlayerDTO: { urlAvatar },
    });
  }
}
