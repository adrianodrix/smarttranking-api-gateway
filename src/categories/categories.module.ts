import { Module } from '@nestjs/common';
import { ProxymqModule } from 'src/proxymq/proxymq.module';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [ProxymqModule],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
