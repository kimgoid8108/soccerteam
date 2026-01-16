import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createClubDto: CreateClubDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.clubsService.create(createClubDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyClub(@Req() req: any) {
    return this.clubsService.findMyClub(Number(req.user.userId));
  }

  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: UpdateClubDto,
  ) {
    return this.clubsService.update(id, updateClubDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.remove(id);
  }
}
