import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { IdValidationParamsPipe } from 'src/common/pipes/id-validation-params.pipe';
import { ClientProxySmartRanking } from 'src/proxymq/client-proxy';
import { IAttachAPlayerDto } from './dtos/attach-player-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CategoryEvents } from './interfaces/category-events.enum';

@Controller('api/v1/categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(
    private readonly clientProxySmartRanking: ClientProxySmartRanking,
    private readonly _t: I18nService,
  ) {}

  private clientAdminBackend: ClientProxy = this.clientProxySmartRanking.getClientProxyAdminBackendInstance();

  @Post('')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    this.logger.log(`create: ${JSON.stringify(createCategoryDto)}`);
    this.clientAdminBackend.emit(CategoryEvents.CREATE, createCategoryDto);
  }

  @Get('')
  findAll(): Observable<any> {
    return this.clientAdminBackend.send(CategoryEvents.FIND, '');
  }

  @Get(':id')
  async findOne(
    @Param('id', IdValidationParamsPipe) id: string,
  ): Promise<Observable<any>> {
    this.logger.log(`findOne: ${id}`);
    const categoryFound = await this.clientAdminBackend
      .send(CategoryEvents.FIND, id)
      .toPromise();
    if (!categoryFound) {
      throw new NotFoundException(
        await this._t.t('categories.notFound', {
          args: { category: id },
        }),
      );
    }
    return categoryFound;
  }

  @Patch(':id')
  update(
    @Param('id', IdValidationParamsPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.log(`update: ${id}, ${JSON.stringify(updateCategoryDto)}`);
    this.clientAdminBackend.emit(CategoryEvents.UPDATE, {
      id,
      updateCategoryDto,
    });
  }

  @Delete(':id')
  remove(@Param('id', IdValidationParamsPipe) id: string) {
    this.logger.log(`delete: ${id}`);
    this.clientAdminBackend.emit(CategoryEvents.DELETE, id);
  }

  @Put(':categoryId/player/:playerId')
  async attachAPlayer(@Param() params: IAttachAPlayerDto): Promise<void> {
    this.logger.log(`attachAPlayer: ${JSON.stringify(params)}`);
    this.clientAdminBackend.emit(CategoryEvents.ATTACH_PLAYER, params);
  }
}
