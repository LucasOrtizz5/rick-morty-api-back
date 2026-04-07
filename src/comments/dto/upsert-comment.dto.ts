import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  content!: string;
}
