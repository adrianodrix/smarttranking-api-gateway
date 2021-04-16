import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { IdValidationParamsPipe } from 'src/common/pipes/id-validation-params.pipe';
import { ClientProxySmartRanking } from 'src/proxymq/client-proxy';
import { AttachMatchChallengeDto } from './dto/attach-match-challente.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeEvents } from './interfaces/challenge-events.enum';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';

@Controller('api/v1/challenges')
export class ChallengesController {
  private readonly logger: Logger = new Logger(ChallengesController.name);
  private clientChallengesBackend: ClientProxy;

  constructor(
    private readonly clientProxySmartRanking: ClientProxySmartRanking,
    private readonly _t: I18nService,
  ) {
    this.clientChallengesBackend = clientProxySmartRanking.getClientProxyChallengesBackendInstance();
  }

  @Post()
  async create(@Body() createChallengeDto: CreateChallengeDto) {
    this.logger.log(`create: ${JSON.stringify(createChallengeDto)}`);
    this.clientChallengesBackend.emit(
      ChallengeEvents.CREATE,
      createChallengeDto,
    );
  }

  @Get()
  findAll(): Observable<any[]> {
    return this.clientChallengesBackend.send(ChallengeEvents.FIND, '');
  }

  @Get(':id')
  async findOne(@Param('id', IdValidationParamsPipe) id: string): Promise<any> {
    this.logger.log(`findOne: ${id}`);

    const challengeFound = await this.clientChallengesBackend
      .send(ChallengeEvents.FIND, { id })
      .toPromise();
    if (!challengeFound) {
      throw new NotFoundException(
        await this._t.t('challenges.notFound', {
          args: { challenge: id },
        }),
      );
    }
    return challengeFound;
  }

  @Get('/matches/:id')
  async findAMatchById(
    @Param('id', IdValidationParamsPipe) id: string,
  ): Promise<any> {
    this.logger.log(`findAMatchById: ${id}`);

    const challengeFound = await this.clientChallengesBackend
      .send(ChallengeEvents.FIND, { matchId: id })
      .toPromise();
    if (!challengeFound) {
      throw new NotFoundException(
        await this._t.t('challenges.notFound', {
          args: { challenge: id },
        }),
      );
    }
    return challengeFound;
  }

  @Patch(':id')
  update(
    @Param('id', IdValidationParamsPipe) id: string,
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
  ): void {
    this.logger.log(`update: ${id}, ${JSON.stringify(updateChallengeDto)}`);

    this.clientChallengesBackend.emit(ChallengeEvents.UPDATE, {
      id,
      updateChallengeDto,
    });
  }

  @Delete(':id')
  delete(@Param('id', IdValidationParamsPipe) id: string): void {
    this.logger.log(`delete: ${id}`);
    this.clientChallengesBackend.emit(ChallengeEvents.DELETE, id);
  }

  @Get('player/:playerId')
  getChallengesByPlayer(
    @Param('playerId', IdValidationParamsPipe) playerId: string,
  ): Observable<any[]> {
    return this.clientChallengesBackend.send(ChallengeEvents.FIND, {
      playerId,
    });
  }

  @Patch(':id/match')
  attachMatchInAChallenge(
    @Param('id', IdValidationParamsPipe) id: string,
    @Body() attachMatchChallengeDto: AttachMatchChallengeDto,
  ): void {
    this.logger.log(
      `attachMatchInAChallenge: ${id}, ${JSON.stringify(
        attachMatchChallengeDto,
      )}`,
    );
    this.clientChallengesBackend.emit(ChallengeEvents.UPDATE, {
      id,
      attachMatchChallengeDto,
    });
  }
}
