import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClubsModule } from './clubs/clubs.module';
import { ClubMembersModule } from './club-members/club-members.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { MatchesModule } from './matches/matches.module';
import { MatchAttendanceModule } from './match-attendance/match-attendance.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        if (!url) {
          throw new Error('DATABASE_URL is missing in .env');
        }
        return {
          type: 'postgres',
          url,
          schema: 'football',
          autoLoadEntities: true,
          synchronize: false,
          logging: config.get('NODE_ENV') === 'development',
          retryAttempts: 5,
          retryDelay: 3000,
          ssl: { rejectUnauthorized: false },
          extra: { ssl: { rejectUnauthorized: false } },
        };
      },
    }),
    AuthModule,
    UsersModule,
    ClubsModule,
    ClubMembersModule,
    JoinRequestsModule,
    MatchesModule,
    MatchAttendanceModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
