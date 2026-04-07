import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CommentsService } from './comments.service';
import { UpsertCommentDto } from './dto/upsert-comment.dto';

@Controller('episodes/:episodeId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Get()
	async getComments(@Param('episodeId', ParseIntPipe) episodeId: number) {
		const commentsData = await this.commentsService.getEpisodeComments(episodeId);

		return {
			header: { resultCode: 0 },
			data: commentsData,
		};
	}

	@Post()
	async createComment(
		@Param('episodeId', ParseIntPipe) episodeId: number,
		@CurrentUser() user: User,
		@Body() dto: UpsertCommentDto,
	) {
		const comment = await this.commentsService.createComment(episodeId, user, dto);

		return {
			header: { resultCode: 0 },
			data: comment,
		};
	}

	@Patch('thread-lock/toggle')
	async toggleThreadLock(
		@Param('episodeId', ParseIntPipe) episodeId: number,
		@CurrentUser() user: User,
	) {
		const thread = await this.commentsService.toggleThreadLock(episodeId, user);

		return {
			header: { resultCode: 0 },
			data: thread,
		};
	}

	@Patch(':commentId')
	async updateComment(
		@Param('episodeId', ParseIntPipe) episodeId: number,
		@Param('commentId') commentId: string,
		@CurrentUser() user: User,
		@Body() dto: UpsertCommentDto,
	) {
		const comment = await this.commentsService.updateComment(
			episodeId,
			commentId,
			user,
			dto,
		);

		return {
			header: { resultCode: 0 },
			data: comment,
		};
	}

	@Delete(':commentId')
	async deleteComment(
		@Param('episodeId', ParseIntPipe) episodeId: number,
		@Param('commentId') commentId: string,
		@CurrentUser() user: User,
	) {
		await this.commentsService.deleteComment(episodeId, commentId, user);

		return {
			header: { resultCode: 0 },
		};
	}
}
