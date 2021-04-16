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
  private proxy: ClientProxy;

  constructor(private readonly configs: ConfigService) {}

  getClientProxyAdminBackendInstance(): ClientProxy {
    if (!this.proxy) {
      this.proxy = this.createProxy();
    }
    return this.proxy;
  }

  private createProxy(): ClientProxy {
    try {
      const rmqUser = this.configs.get<string>('RMQ_USER');
      const rmqPass = this.configs.get<string>('RMQ_PASS');
      const rmqHost = this.configs.get<string>('RMQ_HOST');

      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${rmqUser}:${rmqPass}@${rmqHost}`],
          queue: 'admin-backend',
        },
      });
    } finally {
      this.logger.log(
        `ClientProxy '${ClientProxySmartRanking.name}' initialized`,
      );
    }
  }
}
