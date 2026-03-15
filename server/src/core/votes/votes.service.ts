import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class VotesService {
  private readonly VOTE_RATE_LIMIT = 100; // max votes per hour
  private readonly VOTE_WINDOW = 3600; // 1 hour in seconds

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) { }

  /**
   * Vote on a post (upvote)
   */
  async vote(postId: string, voterId: string) {
    // Check rate limit
    const rateLimitKey = `vote_limit:${voterId}`;
    const { allowed, remaining } = await this.redis.checkRateLimit(
      rateLimitKey,
      this.VOTE_RATE_LIMIT,
      this.VOTE_WINDOW,
    );

    if (!allowed) {
      throw new HttpException(
        `Rate limit exceeded. Try again later. Remaining: ${remaining}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check if already voted
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        postId_voterId: { postId, voterId },
      },
    });

    if (existingVote) {
      // Already voted - return current state
      return { action: 'already_voted', vote: existingVote };
    }

    // Create vote and update post count in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const vote = await tx.vote.create({
        data: {
          postId,
          voterId,
          value: 1,
        },
      });

      const post = await tx.post.update({
        where: { id: postId },
        data: { voteCount: { increment: 1 } },
        select: { voteCount: true },
      });

      return { vote, voteCount: post.voteCount };
    });

    return { action: 'voted', ...result };
  }

  /**
   * Remove vote from a post
   */
  async unvote(postId: string, voterId: string) {
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        postId_voterId: { postId, voterId },
      },
    });

    if (!existingVote) {
      return { action: 'not_voted' };
    }

    // Delete vote and update post count in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.vote.delete({
        where: { id: existingVote.id },
      });

      const post = await tx.post.update({
        where: { id: postId },
        data: { voteCount: { decrement: 1 } },
        select: { voteCount: true },
      });

      return { voteCount: post.voteCount };
    });

    return { action: 'unvoted', ...result };
  }

  /**
   * Get voters for a post
   */
  async getVoters(postId: string, skip = 0, take = 20) {
    const [votes, total] = await Promise.all([
      this.prisma.vote.findMany({
        where: { postId },
        include: {
          voter: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.vote.count({ where: { postId } }),
    ]);

    return {
      data: votes.map((v) => v.voter),
      meta: { total, skip, take },
    };
  }

  /**
   * Check if user has voted on a post
   */
  async hasVoted(postId: string, voterId: string): Promise<boolean> {
    const vote = await this.prisma.vote.findUnique({
      where: {
        postId_voterId: { postId, voterId },
      },
    });
    return !!vote;
  }
}
