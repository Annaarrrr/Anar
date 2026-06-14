import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GenerateController } from './generate.controller';
import { GenerateService } from './generate.service';
import { GenerateValidator } from './generate.validator';
import { GenerateFallback } from './generate.fallback';

@Module({
  imports: [
    HttpModule.register({
      // Default timeout is overridden per-request in GenerateService via rxjs timeout().
      // This acts as a hard safety net at the HTTP client level.
      timeout: 20_000,
      maxRedirects: 3,
    }),
  ],
  controllers: [GenerateController],
  providers: [
    GenerateService,
    GenerateValidator,
    GenerateFallback,
  ],
})
export class GenerateModule {}