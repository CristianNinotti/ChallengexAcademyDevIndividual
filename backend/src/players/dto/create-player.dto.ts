import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsInt, IsIn, Min, Max, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Cristian Ninotti' })
  @IsString()
  @MaxLength(255)
  long_name: string;

  @ApiProperty({ example: 'ST, CF' })
  @IsString()
  @MaxLength(255)
  player_positions: string;

  @ApiPropertyOptional({ example: 'FC Barcelona' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  club_name?: string;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nationality_name?: string;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  overall?: number;

  @ApiPropertyOptional({ example: 88 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  potential?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(50)
  age?: number;

  @ApiPropertyOptional({ enum: ['male', 'female'], default: 'male' })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  @ApiPropertyOptional({ example: 'Right', enum: ['Left', 'Right'] })
  @IsOptional()
  @IsIn(['Left', 'Right'])
  preferred_foot?: string;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(99) pace?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(99) shooting?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(99) passing?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(99) dribbling?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(99) defending?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(99) physic?: number;

  @ApiPropertyOptional({ default: 'custom' })
  @IsOptional()
  @IsString()
  fifa_version?: string;

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsString()
  fifa_update?: string;
}
