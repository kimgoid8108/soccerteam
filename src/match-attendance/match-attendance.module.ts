import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchAttendanceService } from './match-attendance.service';
import { MatchAttendanceController } from './match-attendance.controller';
import { MatchAttendance } from './entities/match-attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchAttendance])],
  controllers: [MatchAttendanceController],
  providers: [MatchAttendanceService],
  exports: [MatchAttendanceService],
})
export class MatchAttendanceModule {}
