import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeCycleDto } from './dto/create-fee-cycle.dto';
import { ConfirmFeeRequestDto } from './dto/confirm-fee-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('fees')
@UseGuards(JwtAuthGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // 운영자: 회비 회차 생성
  @Post('cycles')
  async createFeeCycle(
    @Body() createFeeCycleDto: CreateFeeCycleDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return await this.feesService.createFeeCycle(createFeeCycleDto, userId);
  }

  // 멤버: 입금 신고
  @Post('requests/:id/report')
  async reportFeeRequest(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return await this.feesService.reportFeeRequest(id, userId);
  }

  // 운영자: 입금 확인
  @Post('requests/:id/confirm')
  async confirmFeeRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() confirmDto: ConfirmFeeRequestDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return await this.feesService.confirmFeeRequest(id, userId, confirmDto);
  }

  // 운영자: 회차별 회비 상태 목록 조회
  @Get('cycles/:id/requests')
  async getFeeCycleRequests(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return await this.feesService.getFeeCycleRequests(id, userId);
  }

  // 멤버: 내 회비 요청 목록 조회
  @Get('requests/my')
  async getMyFeeRequests(@Req() req: any) {
    const userId = Number(req.user.userId || req.user.id);
    return await this.feesService.getMyFeeRequests(userId);
  }

  // 클럽별 회비 회차 목록 조회 (owner/member 모두)
  @Get('cycles/club/:clubId')
  async getClubFeeCycles(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Req() req: any,
  ) {
    const userId = Number(req.user.userId || req.user.id);
    return await this.feesService.getClubFeeCycles(clubId, userId);
  }
}
