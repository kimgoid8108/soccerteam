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
  create(@Body() createClubDto: CreateClubDto, @Req() req: any) {
    const adminUserId = Number(req.user.userId || req.user.id);
    return this.clubsService.create(createClubDto, adminUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyClub(@Req() req: any) {
    try {
      const userId = Number(req.user.userId);
      console.log('[ClubsController] getMyClub 호출:', { userId });

      const club = await this.clubsService.findMyClub(userId);
      console.log('[ClubsController] getMyClub 결과:', {
        hasClub: !!club,
        clubId: club?.id,
        clubName: club?.name,
      });

      // null인 경우 명시적으로 null을 JSON으로 반환
      // NestJS가 빈 응답을 보내지 않도록 명시적으로 처리
      if (!club) {
        return { club: null };
      }
      return club;
    } catch (error) {
      console.error('[ClubsController] getMyClub 에러:', error);
      throw error;
    }
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
