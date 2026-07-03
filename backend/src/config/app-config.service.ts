import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from './env-keys.enum';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get(key: EnvKeys): string {
    return this.configService.getOrThrow<string>(key);
  }

  get databaseUrl(): string {
    return this.get(EnvKeys.DATABASE_URL);
  }
}
