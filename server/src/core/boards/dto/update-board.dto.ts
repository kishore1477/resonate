import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  allowAnonymous?: boolean;

  @IsBoolean()
  @IsOptional()
  requireApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  showVoteCount?: boolean;

  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
