import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateFavoriteDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  episode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  air_date!: string;
}
