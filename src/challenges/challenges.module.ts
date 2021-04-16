import { Module } from '@nestjs/common';
import { ProxymqModule } from 'src/proxymq/proxymq.module';

@Module({
  imports: [ProxymqModule],
})
export class ChallengesModule {}
