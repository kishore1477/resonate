import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Infrastructure
import { InfrastructureModule } from './infrastructure/infrastructure.module';

// Auth
import { AuthModule } from './auth/auth.module';

// Core Modules
import { WorkspacesModule } from './core/workspaces/workspaces.module';
import { MembershipsModule } from './core/memberships/memberships.module';
import { BoardsModule } from './core/boards/boards.module';
import { PostsModule } from './core/posts/posts.module';
import { VotesModule } from './core/votes/votes.module';
import { CommentsModule } from './core/comments/comments.module';
import { RoadmapModule } from './core/roadmap/roadmap.module';
import { ChangelogModule } from './core/changelog/changelog.module';

// Public Module
import { PublicModule } from './public/public.module';

// Common
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Infrastructure (Database, Redis, etc.)
    InfrastructureModule,

    // Common utilities
    CommonModule,

    // Authentication & Authorization
    AuthModule,

    // Core business modules
    WorkspacesModule,
    MembershipsModule,
    BoardsModule,
    PostsModule,
    VotesModule,
    CommentsModule,
    RoadmapModule,
    ChangelogModule,

    // Public endpoints
    PublicModule,
  ],
})
export class AppModule { }
