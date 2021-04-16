import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import * as AWS from 'aws-sdk';

@Injectable()
export class AWSService {
  private logger = new Logger(AWSService.name);

  constructor(private readonly configs: ConfigService) {
    const awsConfig = {
      accessKeyId: configs.get<string>('AWS_ACCESS_KEY'),
      secretAccessKey: configs.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: configs.get<string>('AWS_REGION'),
    };
    AWS.config.update(awsConfig);
  }

  public async uploadAvatar(
    file: Express.Multer.File,
    id: string,
  ): Promise<any> {
    const s3 = new AWS.S3({
      apiVersion: this.configs.get<string>('AWS_S3_API_VERSION'),
    });
    const fileExt = file.originalname.split('.')[1];
    const urlKey = `avatars/${id}.${fileExt}`;
    this.logger.log(`urlKey: ${urlKey}`);

    const bucketParams = {
      Body: file.buffer,
      Bucket: process.env.AWS_BUCKET,
      Key: urlKey,
      ACL: 'public-read',
    };

    const data = s3
      .putObject(bucketParams)
      .promise()
      .then(
        (data) => {
          this.logger.log(data);
          return {
            //https://sandbox-adrianodrix.s3.amazonaws.com/avatars/607910cc2c7f6fee6e12aac1.png
            url: `https://${bucketParams.Bucket}.s3.amazonaws.com/${urlKey}`,
          };
        },
        (err) => {
          this.logger.error(err);
          throw new BadRequestException(err);
        },
      );

    return data;
  }
}
