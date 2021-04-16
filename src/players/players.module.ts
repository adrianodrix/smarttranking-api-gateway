import { Module } from '@nestjs/common';
import { AWSModule } from 'src/aws/aws.module';
import { ProxymqModule } from 'src/proxymq/proxymq.module';
import { PlayersController } from './players.controller';

@Module({
  imports: [ProxymqModule, AWSModule],
  controllers: [PlayersController],
})
export class PlayersModule {}
