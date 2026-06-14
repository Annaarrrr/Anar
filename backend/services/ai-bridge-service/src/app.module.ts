import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenerateModule } from './generate/generate.module';

@Module({
  imports: [
    /**
     * ConfigModule — loads .env into process.env globally.
     * isGlobal: true means every module can read env vars without re-importing.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    GenerateModule,
  ],
})
export class AppModule {}