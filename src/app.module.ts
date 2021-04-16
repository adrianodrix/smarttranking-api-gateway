import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { ProxymqModule } from './proxymq/proxymq.module';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';
import { ChallengesModule } from './challenges/challenges.module';
import { AWSModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'ptbr',
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '/common/i18n/'),
      },
    }),
    ProxymqModule,
    CategoriesModule,
    PlayersModule,
    ChallengesModule,
    AWSModule,
  ],
  controllers: [],
})
export class AppModule {}
