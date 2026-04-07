import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { EpisodeComment } from './entities/episode-comment.entity';
import { EpisodeCommentThread } from './entities/episode-comment-thread.entity';
import { UpsertCommentDto } from './dto/upsert-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(EpisodeComment)
    private readonly commentsRepository: Repository<EpisodeComment>,
    @InjectRepository(EpisodeCommentThread)
    private readonly threadsRepository: Repository<EpisodeCommentThread>,
  ) {}

  async getEpisodeComments(episodeId: number) {
    const comments = await this.commentsRepository.find({
      where: { episodeId },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });

    const threadState = await this.getThreadState(episodeId);

    return {
      comments: comments.map((comment) => this.mapComment(comment)),
      thread: this.mapThread(threadState),
    };
  }

  async createComment(episodeId: number, user: User, dto: UpsertCommentDto) {
    const threadState = await this.getThreadState(episodeId);

    if (threadState.commentsLocked && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Comments are disabled for this episode');
    }

    const comment = this.commentsRepository.create({
      episodeId,
      authorId: user.id,
      content: dto.content.trim(),
    });

    const savedComment = await this.commentsRepository.save(comment);
    const hydrated = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: { author: true },
    });

    if (!hydrated) {
      throw new NotFoundException('Comment not found after creation');
    }

    return this.mapComment(hydrated);
  }

  async updateComment(
    episodeId: number,
    commentId: string,
    user: User,
    dto: UpsertCommentDto,
  ) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, episodeId },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const canModerate = user.role === UserRole.ADMIN;
    const isOwner = comment.authorId === user.id;

    if (!canModerate && !isOwner) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = dto.content.trim();

    const updatedComment = await this.commentsRepository.save(comment);
    return this.mapComment(updatedComment);
  }

  async deleteComment(episodeId: number, commentId: string, user: User) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, episodeId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const canModerate = user.role === UserRole.ADMIN;
    const isOwner = comment.authorId === user.id;

    if (!canModerate && !isOwner) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete({ id: commentId, episodeId });
  }

  async toggleThreadLock(episodeId: number, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can lock comments');
    }

    const currentThread = await this.getThreadState(episodeId);

    const nextThread = this.threadsRepository.create({
      ...currentThread,
      episodeId,
      commentsLocked: !currentThread.commentsLocked,
      lockedByUserId: user.id,
      lockedByUserName: user.name,
      lockedByUserRole: UserRole.ADMIN,
      lockedAt: new Date(),
    });

    const savedThread = await this.threadsRepository.save(nextThread);
    return this.mapThread(savedThread);
  }

  private async getThreadState(episodeId: number): Promise<EpisodeCommentThread> {
    const thread = await this.threadsRepository.findOne({ where: { episodeId } });

    return (
      thread ??
      this.threadsRepository.create({
        episodeId,
        commentsLocked: false,
      })
    );
  }

  private mapComment(comment: EpisodeComment) {
    return {
      id: comment.id,
      episodeId: comment.episodeId,
      authorId: comment.author.id,
      authorName: comment.author.name,
      authorEmail: comment.author.email,
      authorRole: comment.author.role,
      authorAvatarUrl: comment.author.profileImageUrl ?? '',
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  private mapThread(thread: EpisodeCommentThread) {
    return {
      episodeId: thread.episodeId,
      commentsLocked: thread.commentsLocked,
      lockedByUserId: thread.lockedByUserId ?? undefined,
      lockedByUserName: thread.lockedByUserName ?? undefined,
      lockedByUserRole: thread.lockedByUserRole ?? undefined,
      lockedAt: thread.lockedAt ? thread.lockedAt.toISOString() : undefined,
    };
  }
}
