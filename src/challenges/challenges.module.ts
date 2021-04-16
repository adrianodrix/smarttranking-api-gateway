import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { PlayersModule } from 'src/players/players.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { ProxymqModule } from 'src/proxymq/proxymq.module';

@Module({
  imports: [ProxymqModule, PlayersModule, CategoriesModule],
  controllers: [ChallengesController],
})
export class ChallengesModule {}
