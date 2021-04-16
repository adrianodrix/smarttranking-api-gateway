import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class ClientProxySmartRanking {
  private logger: Logger = new Logger(ClientProxySmartRanking.name);
  private proxyAdminBackend: ClientProxy;
  private proxyChallengeBackend: ClientProxy;

  constructor(private readonly configs: ConfigService) {}

  getClientProxyAdminBackendInstance(): ClientProxy {
    if (!this.proxyAdminBackend) {
      this.proxyAdminBackend = this.createProxy('admin-backend');
    }
    return this.proxyAdminBackend;
  }

  getClientProxyChallengesBackendInstance(): ClientProxy {
    if (!this.proxyChallengeBackend) {
      this.proxyChallengeBackend = this.createProxy('challenges-backend');
    }
    return this.proxyChallengeBackend;
  }

  private createProxy(queue: string): ClientProxy {
    try {
      const rmqUser = this.configs.get<string>('RMQ_USER');
      const rmqPass = this.configs.get<string>('RMQ_PASS');
      const rmqHost = this.configs.get<string>('RMQ_HOST');

      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${rmqUser}:${rmqPass}@${rmqHost}`],
          queue,
        },
      });
    } finally {
      this.logger.log(
        `ClientProxy '${ClientProxySmartRanking.name}/${queue}' initialized`,
      );
    }
  }
}
