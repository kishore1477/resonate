import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('votes')
@ApiBearerAuth()
@Controller('posts/:postId/votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) { }

  @Post()
  @ApiOperation({ summary: 'Vote on a post' })
  async vote(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.votesService.vote(postId, userId);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove vote from a post' })
  async unvote(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.votesService.unvote(postId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get voters for a post' })
  async getVoters(
    @Param('postId') postId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.votesService.getVoters(postId, skip, take);
  }
}
