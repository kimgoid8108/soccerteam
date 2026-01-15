import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MatchAttendanceService } from './match-attendance.service';
import { CreateMatchAttendanceDto } from './dto/create-match-attendance.dto';
import { UpdateMatchAttendanceDto } from './dto/update-match-attendance.dto';

@Controller('match-attendance')
export class MatchAttendanceController {
  constructor(
    private readonly matchAttendanceService: MatchAttendanceService,
  ) {}

  @Post()
  create(@Body() createMatchAttendanceDto: CreateMatchAttendanceDto) {
    return this.matchAttendanceService.create(createMatchAttendanceDto);
  }

  @Get()
  findAll(@Query('matchId') matchId?: string, @Query('userId') userId?: string) {
    if (matchId) {
      return this.matchAttendanceService.findByMatchId(+matchId);
    }
    if (userId) {
      return this.matchAttendanceService.findByUserId(+userId);
    }
    return this.matchAttendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchAttendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchAttendanceDto: UpdateMatchAttendanceDto,
  ) {
    return this.matchAttendanceService.update(id, updateMatchAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matchAttendanceService.remove(id);
  }
}
