import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchAttendanceDto } from './create-match-attendance.dto';

export class UpdateMatchAttendanceDto extends PartialType(
  CreateMatchAttendanceDto,
) {}
