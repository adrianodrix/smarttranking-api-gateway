import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateCategoryDto } from './dtos/categories/create-category.dto';

@Controller('api/v1')
export class AppController {
  private logger = new Logger(AppController.name);
  private clientAdminBackend: ClientProxy;

  constructor() {
    this.clientAdminBackend = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RMQ_USER}:${process.env.RMQ_PASS}@${process.env.RMQ_HOST}`,
        ],
        queue: 'admin-backend',
      },
    });
    this.logger.log("ClientProxy 'clientAdminBackend' initialized");
  }

  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    this.logger.log(`createCategory: ${JSON.stringify(createCategoryDto)}`);
    this.clientAdminBackend.emit('create-category', createCategoryDto);
  }

  @Get('categories')
  findAllCategories(): Observable<any> {
    return this.clientAdminBackend.send('find-categories', '');
  }

  @Get('categories/:idCategory')
  findOneCategories(@Param('idCategory') idCategory: string): Observable<any> {
    this.logger.log(`findOneCategories: ${idCategory}`);
    return this.clientAdminBackend.send('find-categories', idCategory);
  }
}
