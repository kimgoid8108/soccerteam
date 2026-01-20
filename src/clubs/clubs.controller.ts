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
import { ClubMembersService } from '../club-members/club-members.service';  // ✅ 추가

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly clubsService: ClubsService,
    private readonly clubMembersService: ClubMembersService, // ✅ 추가
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createClubDto: CreateClubDto, @Req() req: any) {
    const adminUserId = Number(req.user.userId || req.user.id);
    return this.clubsService.create(createClubDto, adminUserId);
  }

  // ✅ 구체적인 경로들을 먼저 선언 (파라미터 경로보다 우선)
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

      // 항상 일관된 형식으로 반환: club 객체 또는 null
      return club || null;
    } catch (error) {
      console.error('[ClubsController] getMyClub 에러:', error);
      throw error;
    }
  }

  // ✅ 구체적인 경로: 내가 속한 클럽 목록 조회 (member용)
  @UseGuards(JwtAuthGuard)
  @Get('my-clubs')
  async getMyClubs(@Req() req: any) {
    try {
      const userId = Number(req.user.userId || req.user.id);
      console.log('[ClubsController] getMyClubs 호출:', { userId });

      const memberships = await this.clubMembersService.findByUserId(userId);

      console.log('[ClubsController] getMyClubs 결과:', {
        count: memberships.length,
        clubs: memberships.map(m => ({
          clubId: m.club_id,
          clubName: m.club?.name,
          role: m.role,
        })),
      });

      return memberships.map(m => m.club);
    } catch (error) {
      console.error('[ClubsController] getMyClubs 에러:', error);
      throw error;
    }
  }

  // ✅ 루트 경로
  @Get()
  findAll() {
    return this.clubsService.findAll();
  }

  // ✅ 파라미터 경로들: 더 구체적인 경로를 먼저 선언
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getClubMembers(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    try {
      console.log('[ClubsController] getClubMembers 호출:', {
        clubId: id,
        userId: req.user.userId,
      });

      const members = await this.clubMembersService.findByClubId(id);

      console.log('[ClubsController] getClubMembers 결과:', {
        clubId: id,
        count: members.length,
        members: members.map(m => ({
          id: m.id,
          userId: m.user_id,
          userName: m.user?.name,
          role: m.role,
          status: m.status,
        })),
      });

      return members;
    } catch (error) {
      console.error('[ClubsController] getClubMembers 에러:', error);
      throw error;
    }
  }

  // ✅ 일반 파라미터 경로 (가장 마지막)
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
