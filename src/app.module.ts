import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      // 👇 필요한 엔티티를 모두 여기에 추가
      // entities: [User, Club, ClubMember, JoinRequest, Match, MatchAttendance, Notification, ...],
      autoLoadEntities: true,
      synchronize: false,
      ssl: { rejectUnauthorized: false },
      // ✅ 추가
      schema: 'football',
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
