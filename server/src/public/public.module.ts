import { Module } from '@nestjs/common';
import { PublicBoardController } from './public-board.controller';
import { PublicRoadmapController } from './public-roadmap.controller';
import { PublicChangelogController } from './public-changelog.controller';
import { BoardsModule } from '../core/boards/boards.module';
import { PostsModule } from '../core/posts/posts.module';
import { RoadmapModule } from '../core/roadmap/roadmap.module';
import { ChangelogModule } from '../core/changelog/changelog.module';

@Module({
  imports: [BoardsModule, PostsModule, RoadmapModule, ChangelogModule],
  controllers: [
    PublicBoardController,
    PublicRoadmapController,
    PublicChangelogController,
  ],
})
export class PublicModule { }
