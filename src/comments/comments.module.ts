import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { EpisodeComment } from './entities/episode-comment.entity';
import { EpisodeCommentThread } from './entities/episode-comment-thread.entity';

@Module({
	imports: [TypeOrmModule.forFeature([EpisodeComment, EpisodeCommentThread])],
	controllers: [CommentsController],
	providers: [CommentsService],
})
export class CommentsModule {}
