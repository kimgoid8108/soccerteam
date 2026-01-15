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
import { ClubMembersService } from './club-members.service';
import { CreateClubMemberDto } from './dto/create-club-member.dto';
import { UpdateClubMemberDto } from './dto/update-club-member.dto';

@Controller('club-members')
export class ClubMembersController {
  constructor(private readonly clubMembersService: ClubMembersService) {}

  @Post()
  create(@Body() createClubMemberDto: CreateClubMemberDto) {
    return this.clubMembersService.create(createClubMemberDto);
  }

  @Get()
  findAll(@Query('clubId') clubId?: string, @Query('userId') userId?: string) {
    if (clubId) {
      return this.clubMembersService.findByClubId(+clubId);
    }
    if (userId) {
      return this.clubMembersService.findByUserId(+userId);
    }
    return this.clubMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubMembersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubMemberDto: UpdateClubMemberDto,
  ) {
    return this.clubMembersService.update(id, updateClubMemberDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubMembersService.remove(id);
  }
}
