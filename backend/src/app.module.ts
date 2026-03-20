import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetsModule } from './pets/pets.module';
import { HealthModule } from './health/health.module';
import { CustodyModule } from './custody/custody.module';
import { EventsModule } from './events/events.module';
import { GovernanceModule } from './governance/governance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrestadoresModule } from './prestadores/prestadores.module';
import { VisitantesModule } from './pets/visitantes/visitantes.module';
import { CompromissosModule } from './compromissos/compromissos.module';
import { ScheduleModule } from '@nestjs/schedule';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      {
        ttl: appConfig.rateLimit.ttl,
        limit: appConfig.rateLimit.limit,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PetsModule,
    HealthModule,
    CustodyModule,
    EventsModule,
    GovernanceModule,
    NotificationsModule,
    PrestadoresModule,
    VisitantesModule,
    CompromissosModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
