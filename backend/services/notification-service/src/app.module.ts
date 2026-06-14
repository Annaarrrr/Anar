import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchedulerModule } from './scheduler/scheduler.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    /**
     * ConfigModule — loads .env into process.env globally.
     * isGlobal: true means every module can read env vars without re-importing.
     * envFilePath: '.env' is the default; listed explicitly for clarity.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Feature modules.
    NotificationModule,
    SchedulerModule,
  ],
})
export class AppModule {}